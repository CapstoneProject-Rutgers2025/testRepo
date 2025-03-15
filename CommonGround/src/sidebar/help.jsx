import React, { useState } from "react";
import "./help.css";

const Help = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    { 
      question: "Common asked questions", 
      answer: "Here you can find answers to the most commonly asked questions." 
    },
    { 
      question: "Support +", 
      answer: "Contact our support team via email at support@example.com." 
    },
    { 
      question: "Report Problem", 
      answer: "You can report a problem by filling out our feedback form in the settings page." 
    },
    { 
      question: "Account deletion", 
      answer: "To delete your account, go to settings and follow the account deletion process." 
    },
    { 
      question: "About", 
      answer: "We are a team dedicated to providing the best user experience." 
    }
  ];

  const toggleAnswer = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="help-container">
      <div className="help-box">
        <h2>Help</h2>
        <div className="faq-list">
          {faqData.map((faq, index) => (
            <div key={index} className="faq-item">
              <button className="faq-question" onClick={() => toggleAnswer(index)}>
                {faq.question}
                <span>{openIndex === index ? "▲" : "▼"}</span>
              </button>
              {openIndex === index && <p className="faq-answer">{faq.answer}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Help;
