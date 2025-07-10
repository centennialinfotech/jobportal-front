import { Link, useNavigate } from 'react-router-dom';

function Navbar({ isAuthenticated, isAdmin, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 py-4">
      <div className="mx-auto px-4 flex items-center justify-between" style={{ marginLeft: '20px', marginRight: '20px' }}>
        <Link to="/" className="text-xl font-bold text-white">
          Job Portal
        </Link>
        <nav className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/jobs" className="text-white hover:underline">
                Jobs
              </Link>
              <Link to="/profile/preview" className="text-white hover:underline">
                Profile Preview
              </Link>
              {isAdmin && (
                <>
                  <Link to="/admin/job-posts" className="text-white hover:underline">
                    Manage Posts
                  </Link>
                 
                </>
              )}
              <Link to="/subscription" className="text-white hover:underline">
                Subscription
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-500 transition-all duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:underline">
                Login
              </Link>
              <Link to="/signup" className="text-white hover:underline">
                Signup
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;