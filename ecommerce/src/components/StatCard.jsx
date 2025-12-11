import React from "react"

const StatCard = ({ stat }) => (
  <div className="stat-card about-stat-card">
    <div className="stat-number">{stat.number}</div>
    <div className="stat-label">{stat.label}</div>
  </div>
)

export default StatCard
