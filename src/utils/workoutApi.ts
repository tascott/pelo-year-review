interface FetchWorkoutsOptions {
    userId: string;
    onProgress?: (workouts: any[]) => void;
    debug?: boolean;
}

export async function fetchAllWorkouts({ userId, onProgress, debug = false }: FetchWorkoutsOptions) {
    const fetchedWorkouts: any[] = [];
    let page = 0;
    let hasMore = true;
    const limit = 100;
    const seenPages = new Set<number>();

    while (hasMore) {
        if (seenPages.has(page)) {
            page++;
            continue;
        }
        seenPages.add(page);

        try {
            const response = await fetch(
                `/api/user/${userId}/workouts?limit=${limit}&page=${page}&joins=peloton.ride`,
                {
                    credentials: 'include',
                    headers: {
                        Accept: 'application/json',
                        Origin: 'https://members.onepeloton.com',
                        Referer: 'https://members.onepeloton.com/',
                        'Peloton-Platform': 'web',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch workouts: ${response.status}`);
            }

            const responseText = await response.text();
            
            if (debug) {
                console.log('Raw API Response:', {
                    status: response.status,
                    responseText: responseText.slice(0, 1000),
                });
            }

            const data = JSON.parse(responseText);
            const workouts = data.data || [];

            fetchedWorkouts.push(...workouts);
            
            if (onProgress) {
                onProgress(fetchedWorkouts);
            }

            hasMore = workouts.length === limit;
            page++;
        } catch (error) {
            console.error('Error fetching workouts:', error);
            throw error;
        }
    }

    return fetchedWorkouts;
}
