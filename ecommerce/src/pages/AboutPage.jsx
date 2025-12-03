import React from 'react'
import '../css/AboutPage.css'
import StatCard from '../components/StatCard'
import ValueCard from '../components/ValueCard'
import TeamMemberCard from '../components/TeamMemberCard'
import ronImage from '../assets/images/Picture_Profile-removebg-preview.png'
import diltonImage from '../assets/images/DiltonProfile.png'
import josefImage from '../assets/images/CajesProfile.png'


const AboutPage = () => {
  const stats = [
    { number: '10+', label: 'Years in Business' },
    { number: '50k+', label: 'Happy Customers' },
    { number: '500+', label: 'Shoe Models' },
    { number: '100+', label: 'Brand Partners' }
  ]

  const values = [
    {
      icon: '👞',
      title: 'Quality',
      description: 'We only source the highest quality footwear from trusted manufacturers and brands.'
    },
    {
      icon: '🌟',
      title: 'Excellence',
      description: 'We strive for excellence in every aspect of our business, from selection to service.'
    },
    {
      icon: '🤝',
      title: 'Trust',
      description: 'Building trust with our customers is at the core of everything we do.'
    },
    {
      icon: '♻️',
      title: 'Sustainability',
      description: 'We\'re committed to environmentally friendly practices and sustainable footwear options.'
    }
  ]

  const team = [
    { name: 'Ron Luigi Taghoy', role: 'Developer #1', emoji: '👨‍💻', image: ronImage },
    { name: 'Dilton Rowan Morales', role: 'Developer #2', emoji: '👨‍💻', image: diltonImage },
    { name: 'Josef Cajes', role: 'Developer #3', emoji: '👨‍💻', image: josefImage },
  ]

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="hero-content">
            <h1>About <span className="highlight">ShoeStop</span></h1>
            <p className="hero-subtitle">
              Your trusted multi-category e-commerce destination, bringing you the best products 
              from electronics to fashion, all in one convenient place.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>Our Story</h2>
              <p>
                Founded in 2020, ShoeStop began as a vision to create the ultimate shopping 
                destination where customers could find everything they need without the hassle 
                of visiting multiple stores.
              </p>
              <p>
                What started as a small boutique with a handful of premium shoe brands has grown into
                a thriving online marketplace serving customers worldwide. We've carefully curated
                our collection to ensure that every pair of shoes we sell meets our high standards.
              </p>
              <p>
                Today, we're proud to offer an extensive selection of footwear, from running shoes and
                athletic trainers to formal dress shoes, casual everyday options, and stylish boots.
                Our commitment to quality and customer satisfaction drives everything we do.
              </p>
            </div>
            <div className="story-image">
              <div className="image-placeholder">
                <span style={{fontSize: '100px'}}>👟</span>
                <p>Our Journey</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <h2>Our Impact</h2>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2>Our Values</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <ValueCard key={index} value={value} />
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2>Meet Our Team</h2>
          <div className="team-grid">
            {team.map((member, index) => (
              <TeamMemberCard key={index} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <h2>Our Mission</h2>
            <p>
              To provide exceptional footwear that combines style, comfort, and durability,
              while offering an unparalleled shopping experience that keeps customers coming back.
            </p>
            <div className="mission-points">
              <div className="point">
                <span className="point-icon">🎯</span>
                <span>Curate the best shoes from trusted brands worldwide</span>
              </div>
              <div className="point">
                <span className="point-icon">🌟</span>
                <span>Deliver exceptional customer service and sizing advice</span>
              </div>
              <div className="point">
                <span className="point-icon">🚀</span>
                <span>Innovate and improve the shoe shopping experience</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage