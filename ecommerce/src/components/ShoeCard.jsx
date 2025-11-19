import React from 'react'

const ShoeCard = ({ shoe, onViewProduct, onImageMouseDown, onImageMouseUp, onImageMouseLeave }) => {
  return (
    <div
      className="product-card"
      onClick={() => onViewProduct(shoe)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: 420,
        background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)",
        borderRadius: 20,
        padding: 0,
        transition: "all 0.3s ease",
        border: "1px solid rgba(255,255,255,0.1)",
        position: "relative",
        cursor: "pointer",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        margin: "0 0 24px 0"
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          padding: 0,
          margin: 0,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: "hidden"
        }}
        onMouseDown={e => onImageMouseDown(e, shoe)}
        onMouseUp={onImageMouseUp}
        onMouseLeave={onImageMouseLeave}
      >
        <img
          src={shoe.image}
          alt={shoe.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            background: "transparent",
            borderRadius: 0,
            transition: "transform 0.3s"
          }}
        />
      </div>
      <div
        className="product-info"
        style={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          textAlign: "center",
          padding: "1.5rem 1rem 1.5rem 1rem",
          background: "transparent"
        }}
      >
        <h3
          className="product-name"
          style={{
            fontSize: "1.3rem",
            fontWeight: 600,
            marginBottom: 8
          }}
        >
          {shoe.name}
        </h3>
        <p
          className="product-color"
          style={{
            color: "#b3b3b3",
            marginBottom: 12
          }}
        >
          Color: {shoe.color}
        </p>
        <div
          className="product-rating"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 16
          }}
        >
          <span className="stars">
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ opacity: i < Math.floor(shoe.rating) ? 1 : 0.3 }}>
                ⭐
              </span>
            ))}
          </span>
          <span
            className="rating-value"
            style={{
              color: "#b3b3b3",
              fontSize: "0.9rem"
            }}
          >
            ({typeof shoe.rating === 'number' ? shoe.rating.toFixed(1) : shoe.rating})
          </span>
        </div>
        <div
          className="product-price"
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#ff6b35",
            marginBottom: 20
          }}
        >
          ₱{parseFloat(shoe.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <button
          className="view-product-btn btn-primary"
          style={{
            width: "100%",
            padding: 12,
            fontWeight: 600,
            borderRadius: 8,
            background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)",
            color: "#fff",
            border: "none",
            marginTop: "auto",
            transition: "background 0.3s"
          }}
          onClick={(e) => {
            e.stopPropagation();
            onViewProduct(shoe);
          }}
        >
          View Details
        </button>
      </div>
    </div>
  )
}

export default ShoeCard
