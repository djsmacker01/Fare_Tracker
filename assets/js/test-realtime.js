// Test real-time updates
const testRealTimeUpdates = async () => {
    console.log('Testing real-time updates...');

    // Subscribe to fare updates
    const fareSubscription = supabase
        .channel('test-fare-updates')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'fare_updates'
        }, (payload) => {
            console.log('Fare Update:', payload);
        })
        .subscribe();

    // Subscribe to ride tracking
    const rideSubscription = supabase
        .channel('test-ride-tracking')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'ride_tracking'
        }, (payload) => {
            console.log('Ride Update:', payload);
        })
        .subscribe();

    // Test fare update
    const testFareUpdate = async () => {
        const { data, error } = await supabase
            .from('fare_updates')
            .insert({
                service: 'uber',
                price: 29.99,
                change_percentage: 1.5
            });

        if (error) {
            console.error('Error inserting fare update:', error);
        } else {
            console.log('Test fare update inserted:', data);
        }
    };

    // Test ride tracking update
    const testRideUpdate = async () => {
        const { data, error } = await supabase
            .from('ride_tracking')
            .insert({
                service: 'uber',
                status: 'active',
                location: { lat: 40.7128, lng: -74.0060 },
                eta: new Date(Date.now() + 15 * 60000) // 15 minutes from now
            });

        if (error) {
            console.error('Error inserting ride update:', error);
        } else {
            console.log('Test ride update inserted:', data);
        }
    };

    // Run tests after a short delay
    setTimeout(() => {
        console.log('Running test updates...');
        testFareUpdate();
        testRideUpdate();
    }, 2000);
};

// Run the test when the page loads
document.addEventListener('DOMContentLoaded', () => {
    testRealTimeUpdates();
}); 