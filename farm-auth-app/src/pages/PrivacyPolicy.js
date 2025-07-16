import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaShieldAlt, FaDatabase, FaUserLock } from 'react-icons/fa';
import '../css/PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <div className="privacy-header">
        <Link to="/" className="back-button">
          <FaArrowLeft /> Back to Home
        </Link>
        <h1>FarmConnect Privacy Policy</h1>
        <p className="effective-date">Last Updated: January 1, 2023</p>
      </div>

      <div className="privacy-content">
        <section className="privacy-intro">
          <p>
            At FarmConnect, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
        </section>

        <section className="privacy-section">
          <h2><FaDatabase /> Information We Collect</h2>
          <p>We collect several types of information from and about users of our platform:</p>
          <h3>Personal Information</h3>
          <ul>
            <li>Contact details (name, email, phone number)</li>
            <li>Account credentials</li>
            <li>Professional information (for inspectors)</li>
            <li>Farm details (for farmers)</li>
          </ul>
          <h3>Usage Data</h3>
          <ul>
            <li>IP addresses and device information</li>
            <li>Browser type and version</li>
            <li>Pages visited and features used</li>
            <li>Time and date of access</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2><FaShieldAlt /> How We Use Your Information</h2>
          <p>We use the information we collect for various purposes:</p>
          <ul>
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To allow you to participate in interactive features</li>
            <li>To provide customer support</li>
            <li>To gather analysis to improve our service</li>
            <li>To monitor usage and detect technical issues</li>
            <li>To fulfill any other purpose for which you provide it</li>
          </ul>
        </section>

        <section className="privacy-section">
          <h2><FaUserLock /> Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction or damage. These measures include:
          </p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication procedures</li>
            <li>Staff training on data protection</li>
          </ul>
          <p>
            While we strive to protect your information, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className="privacy-section">
          <h2>Your Data Rights</h2>
          <p>Depending on your location, you may have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Access:</strong> Request copies of your personal data</li>
            <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
            <li><strong>Erasure:</strong> Request deletion of your personal data</li>
            <li><strong>Restriction:</strong> Request restriction of processing</li>
            <li><strong>Portability:</strong> Request transfer of your data</li>
            <li><strong>Objection:</strong> Object to certain processing activities</li>
          </ul>
          <p>To exercise these rights, please contact us using the information in the "Contact Us" section.</p>
        </section>

        <section className="privacy-section">
          <h2>Changes to This Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section className="privacy-section contact-section">
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <address>
            FarmConnect Data Protection Officer<br />
            <a href="mailto:privacy@farmconnect.example.com">privacy@farmconnect.example.com</a><br />
            123 Agriculture Street<br />
            Farmville, FC 12345<br />
            United States
          </address>
        </section>
      </div>

      <div className="privacy-footer">
        <p>© {new Date().getFullYear()} FarmConnect. All rights reserved.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;