import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import '../css/TermsOfService.css';

const TermsOfService = () => {
  return (
    <div className="terms-container">
      <div className="terms-header">
        <Link to="/login" className="back-button">
          <FaArrowLeft /> Back to Login
        </Link>
        <h1>FarmConnect Terms of Service</h1>
        <p className="effective-date">Effective Date: January 1, 2023</p>
      </div>

      <div className="terms-content">
        <section className="terms-section">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the FarmConnect platform ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these Terms, do not use the Service.
          </p>
        </section>

        <section className="terms-section">
          <h2>2. Description of Service</h2>
          <p>
            FarmConnect provides an agricultural management platform that enables farmers and agricultural inspectors to manage farming operations, inspections, and related activities.
          </p>
        </section>

        <section className="terms-section">
          <h2>3. User Responsibilities</h2>
          <p>
            As a user of the Service, you agree to:
          </p>
          <ul>
            <li>Provide accurate and complete registration information</li>
            <li>Maintain the security of your password and account</li>
            <li>Use the Service only for lawful purposes</li>
            <li>Not engage in any activity that interferes with the Service</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>4. Privacy Policy</h2>
          <p>
            Your use of the Service is also governed by our Privacy Policy, which explains how we collect, use, and protect your personal information. By using the Service, you consent to our collection and use of personal data as outlined in the Privacy Policy.
          </p>
        </section>

        <section className="terms-section">
          <h2>5. Intellectual Property</h2>
          <p>
            All content included on the Service, such as text, graphics, logos, and software, is the property of FarmConnect or its content suppliers and protected by copyright laws. You may not modify, reproduce, or distribute any content from the Service without our express written permission.
          </p>
        </section>

        <section className="terms-section">
          <h2>6. Limitation of Liability</h2>
          <p>
            FarmConnect shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul>
            <li>Your access to or use of or inability to access or use the Service</li>
            <li>Any conduct or content of any third party on the Service</li>
            <li>Any unauthorized access, use or alteration of your transmissions or content</li>
          </ul>
        </section>

        <section className="terms-section">
          <h2>7. Modifications to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will provide notice of any changes by posting the updated Terms on our website and updating the "Effective Date" at the top of these Terms. Your continued use of the Service after such modifications constitutes your acceptance of the modified Terms.
          </p>
        </section>

        <section className="terms-section">
          <h2>8. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction where FarmConnect is established, without regard to its conflict of law provisions.
          </p>
        </section>

        <section className="terms-section">
          <h2>9. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <address>
            FarmConnect Support<br />
            support@farmconnect.example.com<br />
            123 Agriculture Street<br />
            Farmville, FC 12345
          </address>
        </section>
      </div>

      <div className="terms-footer">
        <p>© {new Date().getFullYear()} FarmConnect. All rights reserved.</p>
      </div>
    </div>
  );
};

export default TermsOfService;