import React from 'react';
import { Link } from 'react-router-dom';
import { FaBlog, FaRegComment, FaRegEye, FaRegHeart, FaHeart, FaCrown } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function BlogPromotion({ latestPost, onLike }) {
	const { user } = useAuth();

	const stripHtmlAndTruncate = (html, maxLength) => {
		const tmp = document.createElement('div');
		tmp.innerHTML = html;
		const text = tmp.textContent || tmp.innerText || '';
		return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
	};

	if (!latestPost) {
		return null;
	}

	return (
		<div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
			<div className="flex flex-col md:flex-row">
				{latestPost.imageUrl && (
					<div className="md:w-1/3">
						<img src={latestPost.imageUrl} alt={latestPost.title} className="object-cover w-full h-full" />
					</div>
				)}
				<div className="p-6 md:w-2/3">
					<h3 className="text-xl font-bold text-nfl-blue mb-2 flex items-center">
						<FaBlog className="mr-2 text-nfl-purple" />
						Latest Blog Post
					</h3>
					<Link to={`/blog/${latestPost._id}`} className="hover:text-nfl-purple transition duration-300">
						<h4 className="text-lg font-semibold text-nfl-blue mb-2">{latestPost.title}</h4>
					</Link>
					<div className="flex items-center mb-2">
						<FaCrown className="text-nfl-gold mr-2" />
						<span className="text-nfl-blue font-semibold">{latestPost.author.username}</span>
					</div>
					<p className="text-gray-600 text-sm mb-4">
						{new Date(latestPost.createdAt).toLocaleDateString()} • {latestPost.readTimeMinutes} min read
					</p>
					<p className="text-gray-700 mb-4 line-clamp-2">{stripHtmlAndTruncate(latestPost.content, 100)}</p>
					<div className="flex justify-between items-center">
						<div className="flex space-x-4 text-gray-600 text-sm">
							<span className="flex items-center"><FaRegEye className="mr-1" /> {latestPost.views}</span>
							<span className="flex items-center"><FaRegComment className="mr-1" /> {latestPost.comments?.length || 0}</span>
							<button 
								onClick={() => onLike(latestPost._id)} 
								className="flex items-center bg-transparent text-gray-500 hover:text-nfl-purple transition duration-300"
							>
								{user && latestPost.likes.includes(user._id) ? (
									<FaHeart className="mr-1 text-nfl-purple" />
								) : (
									<FaRegHeart className="mr-1" />
								)}
								<span>{latestPost.likes.length}</span>
							</button>
						</div>
						<Link 
							to={`/blog/${latestPost._id}`} 
							className="bg-nfl-purple hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 text-sm"
						>
							Read More
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default BlogPromotion;