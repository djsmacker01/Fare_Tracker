const supabase = require("../config/supabase");

class DatabaseService {
  // Fare History
  async saveFareHistory(fareData) {
    const { data, error } = await supabase.from("fare_history").insert([
      {
        service: fareData.service,
        price: fareData.price,
        from_location: fareData.fromLocation,
        to_location: fareData.toLocation,
        timestamp: new Date().toISOString(),
        context: fareData.context,
      },
    ]);

    if (error) {
      throw error;
    }
    return data;
  }

  async getFareHistory(limit = 100) {
    const { data, error } = await supabase
      .from("fare_history")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }
    return data;
  }

  // User Preferences
  async saveUserPreferences(userId, preferences) {
    const { data, error } = await supabase.from("user_preferences").upsert({
      user_id: userId,
      alert_price: preferences.alertPrice,
      selected_service: preferences.selectedService,
      from_location: preferences.fromLocation,
      to_location: preferences.toLocation,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw error;
    }
    return data;
  }

  async getUserPreferences(userId) {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      throw error;
    }
    return data;
  }

  // Alerts
  async saveAlert(alertData) {
    const { data, error } = await supabase.from("alerts").insert([
      {
        user_id: alertData.userId,
        service: alertData.service,
        price: alertData.price,
        timestamp: new Date().toISOString(),
        context: alertData.context,
        confidence: alertData.confidence,
      },
    ]);

    if (error) {
      throw error;
    }
    return data;
  }

  async getAlerts(userId, limit = 10) {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }
    return data;
  }

  // Peak Hours Data
  async savePeakHoursData(peakData) {
    const { data, error } = await supabase.from("peak_hours").upsert({
      hour: peakData.hour,
      avg_price: peakData.avgPrice,
      demand: peakData.demand,
      efficiency: peakData.efficiency,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      throw error;
    }
    return data;
  }

  async getPeakHoursData() {
    const { data, error } = await supabase
      .from("peak_hours")
      .select("*")
      .order("hour", { ascending: true });

    if (error) {
      throw error;
    }
    return data;
  }
}

module.exports = new DatabaseService();
