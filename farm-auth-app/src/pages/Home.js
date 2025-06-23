import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUserPlus, 
  FaSignInAlt, 
  FaChartLine, 
  FaHorse, 
  FaTractor,
  FaLeaf,
  FaBoxes,
  FaUsers,
  FaMobileAlt
} from 'react-icons/fa';
import '../css/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Modern Farm Management Made Simple</h1>
          <p className="hero-subtitle">
            Streamline your agricultural operations with our all-in-one platform designed to 
            maximize productivity and simplify farm management.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="primary-button">
              <FaUserPlus className="button-icon" />
              <span>Get Started Free</span>
            </Link>
            <Link to="/login" className="secondary-button">
              <FaSignInAlt className="button-icon" />
              <span>Login to Account</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Transform Your Farming Operations</h2>
          <p className="section-subtitle">
            Our comprehensive tools help you manage every aspect of your farm with ease
          </p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FaChartLine />
            </div>
            <h3>Farm Analytics</h3>
            <p>
              Get real-time insights and detailed analytics to make data-driven 
              decisions for your agricultural business.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaHorse />
            </div>
            <h3>Livestock Tracking</h3>
            <p>
              Monitor animal health, breeding cycles, vaccinations, and production 
              metrics all in one centralized system.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaLeaf />
            </div>
            <h3>Crop Management</h3>
            <p>
              Plan planting schedules, track growth stages, and optimize yields with 
              our intelligent crop planning tools.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaTractor />
            </div>
            <h3>Equipment Tracking</h3>
            <p>
              Manage farm machinery maintenance schedules and track equipment usage 
              to maximize operational efficiency.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaBoxes />
            </div>
            <h3>Inventory Control</h3>
            <p>
              Keep track of supplies, feed, and other inventory items with automated 
              alerts for low stock levels.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <FaMobileAlt />
            </div>
            <h3>Mobile Access</h3>
            <p>
              Access all farm data from anywhere with our fully responsive web app 
              and mobile-friendly interface.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>Trusted by Farmers Worldwide</h2>
          <p className="section-subtitle">
            Join thousands of agricultural professionals who have transformed their operations
          </p>
        </div>
        
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>
                "This system has revolutionized how we manage our dairy farm. The livestock 
                tracking features alone have saved us countless hours each week."
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">JD</div>
              <div className="author-info">
                <h4>John Dawson</h4>
                <p>Dairy Farmer, Wisconsin</p>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>
                "The crop planning tools helped us increase our yields by 15% in the first 
                season. The analytics are incredibly insightful."
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">MP</div>
              <div className="author-info">
                <h4>Maria Perez</h4>
                <p>Vineyard Owner, California</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Farm Management?</h2>
          <p>
            Join thousands of farmers who are already saving time and increasing productivity 
            with our comprehensive platform.
          </p>
          <Link to="/register" className="primary-button large">
            <FaUserPlus className="button-icon" />
            <span>Start Your Free Trial</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;