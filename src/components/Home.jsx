import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-white flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
        <h1 className="text-4xl font-extrabold text-primary mb-6">Welcome to Job Portal</h1>
        <p className="text-text text-lg mb-8">Find your dream job or post opportunities for top talent.</p>
        <div className="space-y-4">
          <Link
            to="/login"
            className="block w-full py-3 px-6 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 transition-colors duration-300"
          >
            User Login
          </Link>
          <Link
            to="/signup"
            className="block w-full py-3 px-6 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition-colors duration-300"
          >
            User Signup
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
