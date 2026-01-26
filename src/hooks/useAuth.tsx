import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener BEFORE getting session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Link member by WhatsApp when user logs in or signs up
  const linkMemberByWhatsApp = async (whatsapp: string) => {
    if (!whatsapp) return [];
    
    try {
      const { data, error } = await supabase.rpc('link_member_by_whatsapp', {
        _whatsapp: whatsapp
      });
      
      if (error) {
        console.error("Error linking member by WhatsApp:", error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error("Error linking member by WhatsApp:", err);
      return [];
    }
  };

  const signUp = async (email: string, password: string, fullName: string, whatsapp: string, city?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
          whatsapp: whatsapp,
          city: city || null,
        },
      },
    });
    
    // If signup was successful and user is confirmed, try to link member
    if (!error && data?.user && whatsapp) {
      const linkedGroups = await linkMemberByWhatsApp(whatsapp);
      if (linkedGroups.length > 0) {
        console.log("User linked to groups:", linkedGroups);
      }
    }
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // If sign in was successful, try to link member by WhatsApp from profile
    if (!error && data?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("whatsapp")
        .eq("user_id", data.user.id)
        .maybeSingle();
      
      if (profile?.whatsapp) {
        const linkedGroups = await linkMemberByWhatsApp(profile.whatsapp);
        if (linkedGroups.length > 0) {
          console.log("User linked to groups:", linkedGroups);
        }
      }
    }
    
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { data, error };
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    signInWithGoogle,
  };
};
