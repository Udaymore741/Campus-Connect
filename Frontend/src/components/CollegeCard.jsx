import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";

export default function CollegeCard({ college }) {
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState(college.image);

  useEffect(() => {
    // Ensure the image URL is properly formatted
    if (college.image && !college.image.startsWith('http')) {
      setImageUrl(`http://localhost:8080${college.image}`);
    }
  }, [college.image]);

  return (
    <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/college/${college._id}`}>
        <div className="aspect-video relative">
          {!imageError ? (
            <img
              src={imageUrl}
              alt={college.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <span className="text-2xl font-medium text-primary">
                {college.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold text-center">{college.name}</h3>
        </div>
      </Link>
    </div>
  );
}

CollegeCard.propTypes = {
  college: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired
};