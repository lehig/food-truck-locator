import React from "react";
import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      {/* Reuse your existing glass styling */}
      <div className="glass-box">
        <div className="about-header">
          <h1>About Food Truck Locator</h1>
          <p className="about-subtitle">
            Connect with local food trucks. Helping food truck owners grow
            through visibility, communication, and community since 2025.
          </p>
        </div>

        <div className="about-card">
          <p>
            Food Truck Locator is a platform designed to connect hungry customers
            with the best local food trucks, while also helping food truck owners grow
            their business through visibility, communication, and community.
          </p>

          <p>
            Whether you’re searching for your next favorite meal or running a
            mobile food business, Food Truck Locator makes it easier to discover,
            connect, and engage.
          </p>
        </div>

        <div className="about-columns">
          <div className="about-card">
            <h2>For Customers</h2>
            <p>
              Discover local food trucks quickly and effortlessly. Instead of
              searching across social media pages or guessing where trucks might
              be parked, you can:
            </p>
            <ul>
              <li>Browse food trucks by location</li>
              <li>View menus, hours, and business details</li>
              <li>Follow and subscribe to your favorite trucks</li>
              <li>Stay informed about availability and updates</li>
            </ul>
            <p>
              The goal is simple: make it easy to find great food, support local
              businesses, and never miss out on your favorite spots.
            </p>
          </div>

          <div className="about-card">
            <h2>For Food Truck Businesses</h2>
            <p>
              Manage your presence and reach customers more effectively with a
              centralized profile and messaging flow. Businesses can:
            </p>
            <ul>
              <li>Create and manage a public-facing business profile</li>
              <li>Share menus, hours, and location details</li>
              <li>Communicate directly with subscribed customers</li>
              <li>Build loyalty without relying only on social media</li>
            </ul>
            <p>
              By bringing everything into one place, Food Truck Locator helps
              owners focus less on promotion logistics and more on what they do
              best: serving great food.
            </p>
          </div>
        </div>

        <div className="about-card">
          <h2>Built for Local Communities</h2>
          <p>
            At its core, Food Truck Locator is about strengthening local food
            communities. By bridging the gap between customers and food truck
            owners, the platform supports small businesses while making local
            dining more accessible and enjoyable.
          </p>
        </div>
        
        <div className="about-card">
          <h2>Why I Built Food Truck Locator</h2>
          <p>
            I built this website as a project for my senior year of college. I started with the idea from 
            a friend who complained that he could never find a food truck when he needed to. I did my 
            research on this complaint and found that there were many food trucks in my area that didn't 
            even have a website much less found on google maps.
          </p>
          <p>
            These businesses are especially vulnerable since having a website greatly increases their chance 
            of success. Mobility is also something that I saw a lot with these small businesses. Sometimes 
            they travel and their customers are left wondering where they went. These are 
            some of the reasons that even when I graduated from college, I decided to pilot this: which is 
            the current status of this project. 
          </p>
          <p>
            Not only was it for the business aspect, but it also challenged me to use new technologies that I wasn't 
            familiar with. This whole site is native to cloud services. None of this is run on a single server. Using 
            AWS services like Lambda, API Gateway (RESTful APIs), S3, DynamoDB, and others, I was able to create this website. 
            The front-end uses React, whereas the backend is using Go and NoSQL database. 
          </p>
          <p>
            Since it is only me running this website, there will be bugs and I hope to be constantly fixing as I test the website 
            myself and receive those reports. In those cases, I ask that you have patience and contact me (using the <a href="/contact">contact</a>
            link) as soon as you have issues and let me know what you did beforehand, about what time it happened, and screenshots of 
            what happened if you can. I will respond as fast as I can (typically within 1-2 business days).
          </p>
          <p>
            With all of that said, I also am looking to improve the site as much as possible! If you have any ideas, you can contact me in the 
            same manner with ideas of what you would like to see implemented on this site to make it more user friendly and functional. 
            I am always happy to hear from people using my projects, so don't hesitate to let me know. 
          </p>
          <p>
            Last thing, the area in which this site is operational is currently only in Utah, specifically, the Cache Valley. This 
            is where I am piloting this website and where I am a local to verify businesses that want to be a part of the 
            platform. If you are in another area, let me know where, and as I gather more information, I'll be able to decide where to 
            expand this site next. 
          </p>
        </div>
      </div>
    </div>
  );
}
