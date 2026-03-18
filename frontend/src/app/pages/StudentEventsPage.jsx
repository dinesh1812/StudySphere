import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Loader2, Building, ArrowUpRight, Search, Filter } from 'lucide-react';
import { eventService } from '@/api/eventService';
import { toast } from 'sonner';

export function StudentEventsPage() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter(e => 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.hostAdmin?.collegeName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const res = await eventService.getGlobalEvents();
      if (res.success) {
        setEvents(res.data);
        setFilteredEvents(res.data);
      }
    } catch (error) {
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-3">Events Discovery</h1>
        <p className="text-muted-foreground text-lg">Explore hackathons, workshops, and cultural fests happening across all colleges in the network.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search events, topics, or colleges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-ring outline-none shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors">
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-24"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-10" />
          <p className="text-xl font-medium text-foreground">No upcoming events found</p>
          <p className="text-muted-foreground">Try adjusting your search or check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div key={event.id} className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300">
              <div className="p-6 flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                    {new Date(event.eventDate) > new Date() ? 'Upcoming' : 'Past'}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {event.title}
                </h3>
                
                <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
                  {event.description}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <div className="p-2 bg-secondary rounded-lg"><Clock className="h-4 w-4" /></div>
                    <div>
                      <p className="font-semibold">{new Date(event.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      <p className="text-xs text-muted-foreground">{new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <div className="p-2 bg-secondary rounded-lg"><MapPin className="h-4 w-4" /></div>
                    <p className="font-medium truncate">{event.location}</p>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <div className="p-2 bg-secondary rounded-lg"><Building className="h-4 w-4" /></div>
                    <p className="font-medium truncate">{event.hostAdmin?.collegeName || "Partner College"}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-secondary/30 border-t border-border mt-auto flex items-center justify-between group-hover:bg-primary/5 transition-colors">
                <span className="text-xs font-semibold text-muted-foreground italic">By {event.hostAdmin?.fullName || "Admin"}</span>
                <button 
                  onClick={() => setSelectedEvent(event)}
                  className="flex items-center gap-1 text-sm font-bold text-primary group-hover:translate-x-1 transition-transform"
                >
                  Details <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in transition-all">
          <div className="bg-card w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-b border-border">
              <Calendar className="h-20 w-20 text-primary opacity-20" />
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2 bg-background/50 backdrop-blur-md rounded-full hover:bg-background transition-colors"
              >
                <Filter className="h-5 w-5 rotate-45" /> {/* Using Filter as a close icon replacement if X is not available, but let's see lucide imports */}
              </button>
              <div className="absolute bottom-6 left-8">
                <div className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-widest mb-2 inline-block">
                  Event Detail
                </div>
                <h2 className="text-3xl font-bold text-foreground">{selectedEvent.title}</h2>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-secondary rounded-2xl text-primary"><Clock className="h-6 w-6" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium uppercase tracking-tight">Date & Time</p>
                      <p className="text-lg font-bold text-foreground">
                        {new Date(selectedEvent.eventDate).toLocaleString('en-US', { 
                          weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-secondary rounded-2xl text-primary"><MapPin className="h-6 w-6" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium uppercase tracking-tight">Location</p>
                      <p className="text-lg font-bold text-foreground">{selectedEvent.location}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-secondary rounded-2xl text-primary"><Building className="h-6 w-6" /></div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium uppercase tracking-tight">Organizer</p>
                      <p className="text-lg font-bold text-foreground">{selectedEvent.hostAdmin?.collegeName}</p>
                      <p className="text-sm text-muted-foreground">Admin: {selectedEvent.hostAdmin?.fullName}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-8 mt-8">
                <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">About the Event</h4>
                <div className="prose prose-sm text-foreground/90 max-h-48 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-border">
                  {selectedEvent.description}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setSelectedEvent(null)}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
