import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function CollegeCard({ college }) {
  return (
    <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/college/${college._id}`}>
        <div className="aspect-video relative">
          <img
            src={college.image}
            alt={college.name}
            className="w-full h-full object-cover"
          />
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