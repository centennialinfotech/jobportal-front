import { Link } from 'react-router-dom';

function Navbar({ isAuthenticated, isAdmin, onLogout }) {
  return (
    <header className="bg-gray-800 py-4">
      <div className="mx-auto px-4 flex items-center justify-between" style={{ marginLeft: '20px', marginRight: '20px' }}>
        {/* Left-aligned logo */}
        <Link to="/" className="text-xl font-bold text-white">
          Job Portal
        </Link>

        {/* Right-aligned nav */}
        <nav className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="text-white hover:underline">
                Profile
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-white hover:underline">
                  Admin
                </Link>
              )}
              <button
                onClick={onLogout}
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