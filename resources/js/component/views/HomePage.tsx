import React from 'react';
import { useNavigate } from 'react-router-dom';
import HomeHeader from './forms/components/HomeHeader';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';

const HomePage = () => {
  const navigate = useNavigate();

  const handleSignUp = () => {
    navigate('/register?role=2');
  };

  const handleJoin = () => {
    navigate('/join');
  };

  return (
    <div className="bg-gray-200 min-h-screen">
      <HomeHeader />
      <section className="flex flex-col lg:flex-row items-center justify-evenly py-20 bg-white text-black min-h-screen">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-evenly px-4">
        <div className="text-center lg:text-left lg:w-1/2 flex flex-col items-center lg:items-start">
          <h1 className="text-4xl font-bold mb-4">Personalize Your World with<br />CustMe</h1>
          <p className="text-lg mb-8">Connect with designers and printing providers.</p>
          <div className="flex space-x-4 justify-center lg:justify-start">
            {/* Material UI Sign Up Button */}
            <Button 
              onClick={handleSignUp} 
              variant="contained" 
              color="primary" 
              style={{ backgroundColor: '#f59e0b', color: '#fff' }} // Tailwind's yellow-500
            >
              Sign up
            </Button>
            {/* Material UI Join Button */}
            <Button 
              onClick={handleJoin} 
              variant="outlined" 
              style={{ borderColor: '#d1d5db', color: '#000' }} // Tailwind's gray-300 and black text
            >
              Join
            </Button>
          </div>
        </div>
        <div className="mt-10 lg:mt-0 lg:w-1/2 flex justify-center">
          <img 
            src="https://s3-ap-south-1.amazonaws.com/internshala-blog/wp-content/uploads/2021/02/Careers-in-graphic-design.jpg.webp" 
            alt="Hero" 
            className="w-full h-auto lg:w-96" 
          />
        </div>
      </div>
    </section>
      

      {/* Icon Section */}
      <div className="flex flex-col items-center py-16 bg-white text-black">
        <h1 className="text-3xl font-semibold text-left mb-6 mt-2">Your One-Stop Solution for Custom Designs and Printing Services</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full max-w-6xl pt-8"> 
          <div className="flex flex-col items-center text-center">
            <PeopleAltIcon className="text-4xl mb-4" />
            <p className="text-lg font-medium">
              Work with experienced freelance designers to create personalized products that match your vision.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <DesignServicesIcon className="text-4xl mb-4" />
            <p className="text-lg font-medium">
              Create one-of-a-kind gifts for special occasions like birthdays, anniversaries, or corporate events, all personalized by professional designers.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <LocalPrintshopIcon className="text-4xl mb-4" />
            <p className="text-lg font-medium">
              Choose between local printing providers to print your custom designs on everything from apparel and accessories to business cards, posters, and home decor.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <BusinessCenterIcon className="text-4xl mb-4" />
            <p className="text-lg font-medium">
              From concept creation with a freelance designer to high-quality printing, everything you need is in one place.
            </p>
          </div>
        </div>
        <Button
          variant="contained"
          color="primary"
          className="mt-8"
          style={{ backgroundColor: '#000', color: '#fff' }}
        >
          Join Now
        </Button>
      </div>

      {/* About Section */}
      <div id="about" className="min-h-screen flex justify-center items-center bg-white p-6">
        <div className="bg-gray-200 text-black rounded-lg p-12 max-w-6xl">
          <div className="mb-6">
            <h1 className="text-4xl font-bold">About CustMe</h1> 
          </div>
          <h6 className="text-2xl font-bold">OUR STORY</h6> 
          <p className="text-black text-justify text-xl mt-4"> 
            CustMe was founded on the belief that everyone deserves personalized products that reflect their unique style. Recognizing a market need for affordable, high-quality customization, we created a platform that connects customers with skilled designers and reliable printing services, ensuring a seamless design and print experience. Today, CustMe isn't just a solution—it's a community built on creativity and quality.
          </p>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="min-h-screen flex flex-col items-center rounded-lg justify-center bg-white">
        <h2 className="text-4xl font-bold mt-10 text-black">CustMe Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 w-20 md:w-auto">
          <ServiceCard
            title="Design Services"
            description="Connect with freelance designers to create unique, personalized designs tailored to your needs."
            buttonText="Explore Design Services"
            imageUrl="https://i.pinimg.com/originals/e5/29/ae/e529ae5785e684063b0ecf58137078b6.png"
          />
          <ServiceCard
            title="Printing Services"
            description="Access a wide range of high-quality printing options to bring your designs to life, from digital prints to eco-friendly solutions."
            buttonText="Explore Printing Options"
            imageUrl="https://image.freepik.com/free-vector/digital-printing-concept-illustration_23-2148470662.jpg"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;

const ServiceCard = ({ title, description, buttonText, imageUrl }) => {
  return (
    <Card className="shadow-lg w-full md:w-80 min-h-full h-auto flex flex-col">
      <div className="relative w-full h-87 md:h-60 lg:h-99">
        <img
          src={imageUrl}
          alt={title}
          className="object-cover w-full h-full"
        />
      </div>
      <CardContent className="flex-grow text-center p-4">
        <Typography variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mt-2">
          {description}
        </Typography>
      </CardContent>
      <CardActions className="justify-center p-2">
        <Button
          variant="contained"
          className="w-full justify-center rounded-md bg-blue-600 px-3 py-1 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {buttonText}
        </Button>
      </CardActions>
    </Card>
  );
};
