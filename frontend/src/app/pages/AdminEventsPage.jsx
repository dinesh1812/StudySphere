import { useState, useEffect } from 'react';
import { Calendar, Plus, MapPin, Clock, Loader2, Send, Trash2 } from 'lucide-react';
import { eventService } from '@/api/eventService';
import { getUser } from '@/auth/auth';
import { toast } from 'sonner';

export function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const user = getUser();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setIsLoading(true);
      const res = await eventService.getGlobalEvents();
      if (res.success) {
        // Filter for this college's events
        const myEvents = res.data.filter(e => e.hostCollegeId === user.collegeId);
        setEvents(myEvents);
      }
    } catch (error) {
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.eventDate || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        hostCollegeId: user.collegeId,
        adminId: user.id // Will be overridden by header but good for DTO
      };
      
      const res = await eventService.createEvent(payload);
      if (res.success) {
        toast.success("Event broadcasted successfully!");
        setFormData({ title: '', description: '', eventDate: '', location: '' });
        setShowForm(false);
        fetchMyEvents();
      }
    } catch (error) {
      toast.error("Failed to post event");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Events Management</h1>
          <p className="text-muted-foreground">Broadcast hackathons, culturals, and workshops to all students</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          {showForm ? 'Cancel' : <><Plus className="h-4 w-4" /> Post Event</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm animate-in fade-in slide-in-from-top-4">
          <h2 className="text-xl font-semibold mb-6">Create New Event</h2>
          <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Event Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Annual Inter-College Hackathon 2024"
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the event, prizes, and registration details..."
                rows={4}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Event Date & Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="datetime-local"
                  value={formData.eventDate}
                  onChange={e => setFormData({...formData, eventDate: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="e.g., University Auditorium or Zoom Link"
                  className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-ring outline-none"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Publish Global Event
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <h2 className="text-xl font-semibold mb-2">Your Published Events</h2>
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-lg border-dashed">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">You haven't posted any events yet.</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{event.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{event.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-primary font-medium">
                      <Clock className="h-4 w-4" />
                      {new Date(event.eventDate).toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
