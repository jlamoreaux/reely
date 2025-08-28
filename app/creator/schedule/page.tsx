"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function SchedulePage() {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [description, setDescription] = useState("");
  
  const scheduledPosts = useQuery(
    api.scheduledPosts.getScheduledPosts,
    userId ? { userId } : "skip"
  );
  
  const schedulingStats = useQuery(
    api.scheduledPosts.getSchedulingAnalytics,
    userId ? { userId } : "skip"
  );
  
  const schedulePost = useMutation(api.scheduledPosts.schedulePost);
  const cancelPost = useMutation(api.scheduledPosts.cancelScheduledPost);
  const updatePost = useMutation(api.scheduledPosts.updateScheduledPost);
  
  const handleSchedulePost = async () => {
    if (!userId || !selectedDate || !selectedTime) return;
    
    const scheduledFor = new Date(`${selectedDate}T${selectedTime}`).getTime();
    
    await schedulePost({
      userId,
      videoData: "mock-video-data", // Would be actual video data
      thumbnailUrl: "/api/placeholder/120/160",
      duration: 60,
      description,
      scheduledFor,
    });
    
    setShowScheduleModal(false);
    setSelectedDate("");
    setSelectedTime("");
    setDescription("");
  };
  
  const handleCancelPost = async (postId: Id<"scheduledPosts">) => {
    if (confirm("Are you sure you want to cancel this scheduled post?")) {
      await cancelPost({ scheduledPostId: postId });
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scheduled Posts</h1>
          <p className="text-gray-600 mt-1">
            Plan and schedule your content in advance
          </p>
        </div>
        
        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-4 py-2 bg-sage-400 text-white rounded-lg hover:bg-sage-500 transition-colors flex items-center gap-2"
        >
          <span>📅</span>
          Schedule New Post
        </button>
      </div>
      
      {/* Scheduling Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <span className="text-3xl mb-2 block">📅</span>
          <p className="text-gray-600 text-sm">Scheduled</p>
          <p className="text-2xl font-bold text-gray-900">
            {schedulingStats?.totalScheduled || 0}
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <span className="text-3xl mb-2 block">📍</span>
          <p className="text-gray-600 text-sm">This Week</p>
          <p className="text-2xl font-bold text-gray-900">
            {schedulingStats?.upcomingThisWeek || 0}
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <span className="text-3xl mb-2 block">📊</span>
          <p className="text-gray-600 text-sm">Best Day</p>
          <p className="text-lg font-bold text-gray-900">
            {schedulingStats?.mostScheduledDay || "N/A"}
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <span className="text-3xl mb-2 block">⏰</span>
          <p className="text-gray-600 text-sm">Best Time</p>
          <p className="text-lg font-bold text-gray-900">
            {schedulingStats?.mostScheduledTime || "N/A"}
          </p>
        </div>
      </div>
      
      {/* Calendar View */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Upcoming Schedule
        </h2>
        
        {scheduledPosts && scheduledPosts.length > 0 ? (
          <div className="space-y-3">
            {scheduledPosts.map((post) => (
              <div
                key={post._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-20 bg-gray-300 rounded-lg flex-shrink-0">
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      📹
                    </div>
                  </div>
                  
                  {/* Post Details */}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {post.description || "Untitled Post"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {post.scheduledDate} at {post.scheduledTime}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Duration: {post.duration}s
                    </p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Open edit modal
                      setSelectedDate(new Date(post.scheduledFor).toISOString().split('T')[0]);
                      setSelectedTime(new Date(post.scheduledFor).toTimeString().slice(0, 5));
                      setDescription(post.description || "");
                      setShowScheduleModal(true);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleCancelPost(post._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-5xl mb-3 block">📅</span>
            <p className="text-gray-600">No scheduled posts</p>
            <p className="text-sm text-gray-500 mt-1">
              Schedule your content to maintain consistency
            </p>
          </div>
        )}
      </div>
      
      {/* Best Times Suggestion */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Suggested Posting Times
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">Morning</span>
              <span className="text-green-600">High Engagement</span>
            </div>
            <p className="text-gray-600">7:00 AM - 9:00 AM</p>
            <p className="text-sm text-gray-500 mt-1">
              Catch viewers during morning routine
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">Lunch</span>
              <span className="text-blue-600">Medium Engagement</span>
            </div>
            <p className="text-gray-600">12:00 PM - 1:00 PM</p>
            <p className="text-sm text-gray-500 mt-1">
              Viewers checking during lunch break
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">Evening</span>
              <span className="text-purple-600">Peak Engagement</span>
            </div>
            <p className="text-gray-600">7:00 PM - 10:00 PM</p>
            <p className="text-sm text-gray-500 mt-1">
              Prime time for maximum reach
            </p>
          </div>
        </div>
      </div>
      
      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Schedule Post
            </h3>
            
            <div className="space-y-4">
              {/* Video Preview */}
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-4xl">📹</span>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Add a description..."
                />
              </div>
              
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedulePost}
                  className="px-4 py-2 bg-sage-400 text-white rounded-lg hover:bg-sage-500 transition-colors"
                >
                  Schedule Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}