import React, { useState } from "react";
import "./help.css";

const Help = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [openSubIndex, setOpenSubIndex] = useState({});

  const faqData = [
    {
      question: "General",
      answer: "Here you can find answers to the most commonly asked questions.",
      subItems: [
        { question: "How do swipes work?", answer: "Swipe right on a card to request joining a group; swipe left to pass and skip it." },
        { question: "Do I have unlimited swipes?", answer: "Yes! You can swipe as much as you want." },
        { question: "How do I switch my interest?", answer: "Go to Profile > Intrest, here you can change any interest." },
        { question: "How do I leave a group?", answer: "Open the group page you have joined and click the 'Leave Group' button at the top." },
        { question: "How can I change my profile picture?", answer: "Go to Profile > Settings, click your current picture, and upload a new one." }
      ]
    },
    {
      question: "Support",
      subItems: [
        { question: "Contact Us", answer: "Email us at commonGround@gmail.com" },
        { question: "Support Hours", answer: "Our support team is available Monday–Friday, 9am–5pm ET." }
      ]
    },
    {
      question: "Report Problem",
      subItems: [
        { question: "How do I report a bug?", answer: "Navigate to Settings > Feedback and fill out the 'Report Problem' form." },
        { question: "How can I suggest a feature?", answer: "Use the same Feedback form and select 'Feature Request' as the type." }
      ]
    },
    {
      question: "Account deletion",
      subItems: [
        { question: "How do I delete my account?", answer: "Go to Profile > Settings > Account > Delete Account and follow the prompts." },
        { question: "Can I recover my data after deletion?", answer: "No. Once deleted, your data is permanently removed." }
      ]
    },
    {
      question: "About",
      subItems: [
        { question: "Objective", answer: "A platform to connect collaborators based on skills & interests using swipe-based matching." },
        { question: "Problems", answer: "Finding skilled collaborators is time-consuming; existing platforms aren't built for spontaneous collaboration." },
        { question: "Vision", answer: "Simplify collaboration, foster innovation by connecting like-minded individuals seamlessly." }
      ]
    }
  ];

  const toggleAnswer = (idx) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  const toggleSubAnswer = (parentIdx, subIdx) => {
    setOpenSubIndex(prev => ({
      ...prev,
      [parentIdx]: prev[parentIdx] === subIdx ? null : subIdx
    }));
  };

  return (
    <div className="help-container">
      <div className="help-box">
        <h2>Help</h2>
        <ul className="faq-list">
          {faqData.map((faq, idx) => (
            <li key={idx} className="faq-item">
              <button className="faq-question" onClick={() => toggleAnswer(idx)}>
                {faq.question}
                <span className="arrow">{openIndex === idx ? "▲" : "▼"}</span>
              </button>
              {openIndex === idx && (
                <div className="faq-details">
                  {faq.answer && <p className="faq-answer">{faq.answer}</p>}
                  <ul className="sub-faq-list">
                    {faq.subItems.map((sub, sIdx) => (
                      <li key={sIdx} className="sub-faq-item">
                        <button
                          className="sub-faq-question"
                          onClick={() => toggleSubAnswer(idx, sIdx)}
                        >
                          {sub.question}
                          <span className="arrow">{openSubIndex[idx] === sIdx ? "▲" : "▼"}</span>
                        </button>
                        {openSubIndex[idx] === sIdx && (
                          <p className="sub-faq-answer">{sub.answer}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Help;
