import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    display_name: "",
    real_name: "",
    email: user?.email || "",
    phone: "",
    education: ""
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("profiles")
      .select("display_name, real_name, email, phone, education")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setForm(f => ({ ...f, ...data }));
        setLoading(false);
        setEditMode(false);
      });
  }, [user]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      ...form
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Profile updated!" });
      setEditMode(false);
    }
  };

  if (!user) return <div className="p-8">Please sign in to view your profile.</div>;
  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Display Name</label>
          <input
            name="display_name"
            value={form.display_name}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground ${!editMode ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Real Name</label>
          <input
            name="real_name"
            value={form.real_name}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground ${!editMode ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground opacity-60 cursor-not-allowed"
            disabled
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Phone Number</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground ${!editMode ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Education</label>
          <input
            name="education"
            value={form.education}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border border-border bg-secondary text-foreground ${!editMode ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={!editMode}
          />
        </div>
        {editMode ? (
          <button type="submit" className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium">Save</button>
        ) : (
          <button type="button" onClick={() => setEditMode(true)} className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium">Edit</button>
        )}
      </form>
    </div>
  );
};

export default Profile;
