import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaLeaf, FaChartLine, FaHandsHelping } from 'react-icons/fa';
import '../css/AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <Link to="/" className="back-button">
          <FaArrowLeft /> Back to Home
        </Link>
        <h1>About FarmConnect</h1>
        <p className="tagline">Connecting Farmers and Inspectors for a Better Agricultural Future</p>
      </div>

      <div className="about-content">
        <section className="about-section mission">
          <div className="icon-container">
            <FaLeaf className="section-icon" />
          </div>
          <h2>Our Mission</h2>
          <p>
            FarmConnect was founded in 2020 with a simple mission: to bridge the gap between farmers and agricultural inspectors through technology. We believe that by streamlining communication and documentation, we can help improve agricultural practices, increase transparency, and boost productivity across the farming sector.
          </p>
        </section>

        <section className="about-section features">
          <div className="icon-container">
            <FaChartLine className="section-icon" />
          </div>
          <h2>What We Offer</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>For Farmers</h3>
              <ul>
                <li>Digital record keeping</li>
                <li>Inspection scheduling</li>
                <li>Compliance tracking</li>
                <li>Resource management</li>
              </ul>
            </div>
            <div className="feature-card">
              <h3>For Inspectors</h3>
              <ul>
                <li>Digital inspection forms</li>
                <li>Real-time reporting</li>
                <li>Farm data access</li>
                <li>Task management</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="about-section team">
          <div className="icon-container">
            <FaUsers className="section-icon" />
          </div>
          <h2>Our Team</h2>
          <p>
            FarmConnect is built by a diverse team of agricultural experts, software engineers, and user experience designers who are passionate about improving the agricultural sector through technology. With decades of combined experience in both agriculture and tech, we understand the unique challenges farmers and inspectors face.
          </p>
          <div className="team-stats">
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Team Members</span>
            </div>
            <div className="stat">
              <span className="stat-number">5,000+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat">
              <span className="stat-number">15+</span>
              <span className="stat-label">Countries Served</span>
            </div>
          </div>
        </section>

        <section className="about-section values">
          <div className="icon-container">
            <FaHandsHelping className="section-icon" />
          </div>
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Sustainability</h3>
              <p>Promoting farming practices that protect our environment for future generations</p>
            </div>
            <div className="value-card">
              <h3>Transparency</h3>
              <p>Ensuring clear communication between all agricultural stakeholders</p>
            </div>
            <div className="value-card">
              <h3>Innovation</h3>
              <p>Continuously improving our platform to meet evolving needs</p>
            </div>
            <div className="value-card">
              <h3>Community</h3>
              <p>Building a network that supports and learns from each other</p>
            </div>
          </div>
        </section>
      </div>

      <div className="about-footer">
        <p>Interested in joining our team? <Link to="/contact">Contact us</Link> about career opportunities.</p>
        <p className="copyright">© {new Date().getFullYear()} FarmConnect. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AboutUs;