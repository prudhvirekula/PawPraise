import React from 'react';
import { services } from '../Pages/dummyData';

const Services = () => {
  return (
    <section className="services d-flex flex-column align-items-center">
      <img
        src="https://res.cloudinary.com/dmzqckfj4/image/upload/v1706504553/home%20page/bqajzjmxxfnmqzsokwxi.png"
        alt=""
      />
      <h1 className="mt-2 mb-5 text-black text-center fw-bolder">
        <span>What your pet needs,</span> when they need it.
      </h1>
      
    </section>
  );
};

export default Services;
