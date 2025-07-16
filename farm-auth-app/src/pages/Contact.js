import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import '../css/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    console.log('Form submitted:', formData);
    setSubmitStatus('success');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    // Reset status after 5 seconds
    setTimeout(() => {
      setSubmitStatus(null);
    }, 5000);
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <Link to="/" className="back-button">
          <FaArrowLeft /> Back to Home
        </Link>
        <h1>Contact FarmConnect</h1>
        <p className="subtitle">We'd love to hear from you!</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <div className="info-card">
            <div className="info-icon">
              <FaEnvelope />
            </div>
            <h3>Email Us</h3>
            <p>General Inquiries: <a href="mailto:info@farmconnect.example.com">info@farmconnect.example.com</a></p>
            <p>Support: <a href="mailto:support@farmconnect.example.com">support@farmconnect.example.com</a></p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <FaPhone />
            </div>
            <h3>Call Us</h3>
            <p>Customer Service: <a href="tel:+18005551234">+1 (800) 555-1234</a></p>
            <p>Business Hours: Mon-Fri, 9AM-5PM EST</p>
          </div>

          <div className="info-card">
            <div className="info-icon">
              <FaMapMarkerAlt />
            </div>
            <h3>Visit Us</h3>
            <p>123 Agriculture Street</p>
            <p>Farmville, FC 12345</p>
            <p>United States</p>
          </div>
        </div>

        <div className="contact-form-container">
          <h2>Send Us a Message</h2>
          {submitStatus === 'success' && (
            <div className="success-message">
              Thank you for your message! We'll get back to you soon.
            </div>
          )}
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-button">
              <FaPaperPlane /> Send Message
            </button>
          </form>
        </div>
      </div>

      <div className="contact-footer">
        <p>For press inquiries, please email <a href="mailto:press@farmconnect.example.com">press@farmconnect.example.com</a></p>
        <p className="copyright">© {new Date().getFullYear()} FarmConnect. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Contact;