<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class PostController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            $post = Post::create([
                'title' => $validated['title'],
                'content' => $validated['content'],
                'user_id' => Auth::id(),
            ]);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $imagePath = $image->store('images', 'public');
                    Image::create([
                        'image_path' => $imagePath,
                        'post_id' => $post->post_id,
                    ]);
                }
            }

            return response()->json(['post' => $post->load('images')], 201);
        } catch (\Exception $e) {
            Log::error('Post creation failed: ', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to create post. Please try again.'], 500);
        }
    }

    public function displayPost(Request $request)
    {
        $perPage = $request->get('limit', 4); // Default limit of 4
        $page = $request->get('page', 1);  // Default page to 1

        try {
            $posts = Post::with(['images', 'user.role'])
                ->orderBy('created_at', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            return response()->json([
                'data' => $posts->items(),
                'total' => $posts->total(),
                'last_page' => $posts->lastPage(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching posts: ', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch posts. Please try again.'], 500);
        }
    }

    public function index(Request $request)
    {
        $posts = Post::with('user', 'images')->paginate($request->limit);
        return response()->json([
            'posts' => $posts->items(),
            'total' => $posts->total(),
        ]);
    }

    public function show($id)
    {
        $post = Post::with(['images', 'user.role'])->find($id);

        if (!$post) {
            return response()->json(['error' => 'Post not found'], 404);
        }

        return response()->json($post);
    }

    public function updatePost(Request $request, $postId)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'images.*' => 'mimes:jpeg,jpg,png,gif|required|max:5000',
            'existingImages' => 'array',
        ]);

        try {
            $post = Post::findOrFail($postId);

            if ($post->user_id !== Auth::id()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $post->update($validated);

            $existingImages = $request->input('existingImages', []);
            $post->images()->whereNotIn('image_id', $existingImages)->each(function ($image) {
                Storage::disk('public')->delete($image->image_path);
                $image->delete();
            });

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $imagePath = $image->store('images', 'public');
                    Image::create([
                        'image_path' => $imagePath,
                        'post_id' => $post->post_id,
                    ]);
                }
            }

            return response()->json($post->load('images'), 200);
        } catch (\Exception $e) {
            Log::error('Post update failed: ', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to update post. Please try again.'], 500);
        }
    }

    public function destroy(Post $post)
    {
        try {
            if ($post->user_id !== Auth::id()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $post->images->each(function ($image) {
                Storage::disk('public')->delete($image->image_path);
                $image->delete();
            });

            $post->delete();

            return response()->json(['message' => 'Post deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Error deleting post: ', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to delete post. Please try again.'], 500);
        }
    }

    private function fetchPostsByRole($roleName)
    {
        return Post::whereHas('user.role', function ($query) use ($roleName) {
            $query->where('rolename', $roleName);
        })
            ->with(['images', 'user.role'])
            ->get();
    }

    public function getGraphicDesignerPosts()
    {
        return $this->fetchPostsByRole('Graphic Designer');
    }

    public function getPrintingProviderPosts()
    {
        return $this->fetchPostsByRole('Printing Shop');
    }

    public function getClientPosts()
    {
        return $this->fetchPostsByRole('User');
    }

    public function getMyPosts()
    {
        try {
            $posts = Post::where('user_id', Auth::id())
                ->with(['images', 'user.role'])
                ->get();

            return response()->json(['posts' => $posts], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching user posts: ', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch posts. Please try again.'], 500);
        }
    }

    public function getPosts(Request $request)
    {
        $posts = Post::select('id', 'title', 'content', 'image', 'created_at')
            ->where('user_id', $request->user_id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        return response()->json($posts);
    }

    public function getUserImages()
    {
        try {
            $images = Image::whereHas('post', function ($query) {
                $query->where('user_id', Auth::id());
            })->get();

            return response()->json(['images' => $images], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching user images: ', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch images. Please try again.'], 500);
        }
    }
}
