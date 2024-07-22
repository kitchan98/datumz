import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaPhone, FaMapMarkerAlt, FaCheckCircle, FaExclamationCircle, FaEnvelope } from 'react-icons/fa';
import emailjs from 'emailjs-com';
import './Contact.css';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const Contact = () => {
  const [submitStatus, setSubmitStatus] = useState(null);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    message: Yup.string().required('Message is required')
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const result = await emailjs.send(
        'service_20cnorp',
        'template_15jdxgq',
        values,
        'SF_Mf5rPsbaV133ly'
      );
      console.log(result.text);
      setSubmitStatus('success');
      resetForm();
    } catch (error) {
      console.error('Error during form submission:', error);
      setSubmitStatus('error');
    }
    setSubmitting(false);
  };

  const position = [51.511564, -0.116462]; // KCL coordinates

  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1>HAVE A QUESTION?</h1>

        <div className="content-wrapper">
          <div className="form-container">
            <Formik
              initialValues={{ name: '', email: '', message: '' }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="form-group">
                    <Field type="text" name="name" placeholder="Your name" />
                    <ErrorMessage name="name" component="div" className="error" />
                  </div>

                  <div className="form-group">
                    <Field type="email" name="email" placeholder="Your email" />
                    <ErrorMessage name="email" component="div" className="error" />
                  </div>

                  <div className="form-group">
                    <Field as="textarea" name="message" placeholder="Your message" />
                    <ErrorMessage name="message" component="div" className="error" />
                  </div>

                  <button type="submit" disabled={isSubmitting}>
                    SEND
                  </button>

                  {submitStatus && (
                    <div className={`message-container ${submitStatus} visible`}>
                      {submitStatus === 'success' ? (
                        <>
                          <FaCheckCircle className="message-icon" />
                          <span className="message-text">Thank you for your message. We will get back to you soon!</span>
                        </>
                      ) : (
                        <>
                          <FaExclamationCircle className="message-icon" />
                          <span className="message-text">An error occurred. Please try again later.</span>
                        </>
                      )}
                    </div>
                  )}
                </Form>
              )}
            </Formik>
          </div>

          <div className="map-container">
            <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={position}>
                <Popup>
                  King's College London
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>

        <div className="contact-info">
          <div className="info-item">
            <FaPhone />
            <p>+44 (0)7916130306</p>
          </div>
          <div className="info-item">
            <FaEnvelope />
            <p>kit@datumz.co</p>
          </div>
          <div className="info-item">
            <FaMapMarkerAlt />
            <p>
              King's College London<br />
              Strand<br />
              London WC2R 2LS<br />
              United Kingdom
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;