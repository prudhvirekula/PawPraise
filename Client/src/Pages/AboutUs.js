import React from "react";
import "../Styles/AboutUs.css";

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <div className="hero-section">
        <img
          src="https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" // Replace with actual hero image URL
          alt="About Us Hero"
          className="hero-image"
        />
        <h1 className="hero-title">Welcome to Paw-Praise</h1>
      </div>
      <div className="content-section">
        <h2>Who We Are</h2>
        <p>
        At PawPraise, we are passionate pet lovers committed to enhancing the lives of pets and their owners. Our mission is to create a vibrant, supportive community where pet parents can discover the best products, share their experiences, and make informed decisions for their furry companions.

Our team is made up of pet enthusiasts, product experts, and tech innovators, all dedicated to helping you find the best for your pets. Whether it’s finding the perfect chew toy for your dog or a nutritious food brand for your cat, PawPraise is here to support every step of your pet care journey.

Together, let's celebrate the love, joy, and companionship that pets bring into our lives!

PawPraise - Because pets deserve the best.
        </p>
        <img
          src="https://images.pexels.com/photos/16410936/pexels-photo-16410936/free-photo-of-cat-in-the-park.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" // Replace with actual image URL
          alt="Happy Pet"
          className="content-image"
        />
        <h2>Our Mission</h2>
        <p>
        At PawPraise, we are passionate pet lovers committed to enhancing the lives of pets and their owners. Our mission is to create a vibrant, supportive community where pet parents can discover the best products, share their experiences, and make informed decisions for their furry companions.
        </p>
        <h2>Why Choose Us?</h2>
        <ul className="why-choose-us-list">
          <li>At PawPraise, we are passionate pet lovers committed to enhancing the lives of pets and their owners. Our mission is to create a vibrant, supportive community where pet parents can discover the best products, share their experiences, and make informed decisions for their furry companions.</li>
          <li>Tailored Recommendations: Our platform helps you discover products that perfectly match your pet's needs, saving you time and effort.</li>
          <li>Community-Driven: We believe in the power of shared experiences. PawPraise is built by pet parents, for pet parents - a place where you can ask questions, share advice, and connect with a caring community.</li>
          <li>Quality You Deserve: We prioritize products that meet high standards of safety, comfort, and happiness for pets, so you can shop with confidence.</li>
          <li>A Celebration of Pets: Your pets deserve the best, and we're here to ensure they get it. PawPraise is more than just a platform - it's a tribute to the joy pets bring to our lives.</li>
        </ul>
        <img
          src="https://placedog.net/400/300" // Replace with actual image URL
          alt="Dog with Food Bowl"
          className="content-image"
        />
        <h2>Join the PawPraise Family</h2>
        <p>
        At PawPraise, we believe that pets are more than just companions—they're family. By joining our community, you become part of a family that celebrates the joy, love, and happiness pets bring to our lives every day.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
