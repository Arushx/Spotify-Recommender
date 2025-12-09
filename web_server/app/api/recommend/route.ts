import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

// Define types for our data
interface Song {
    track_name: string;
    'artist(s)_name': string;
    released_year: number;
    streams: number;
    bpm: number;
    'danceability_%': number;
    'valence_%': number;
    'energy_%': number;
    'acousticness_%': number;
    'instrumentalness_%': number;
    'liveness_%': number;
    'speechiness_%': number;
    [key: string]: any;
}

interface ScalerParams {
    mean: { [key: string]: number };
    scale: { [key: string]: number };
}

// Cache data in memory to avoid reading files on every request
let cachedSongs: Song[] | null = null;
let cachedScaler: ScalerParams | null = null;

async function loadData() {
    if (cachedSongs && cachedScaler) {
        return { songs: cachedSongs, scaler: cachedScaler };
    }

    const dataDir = path.join(process.cwd(), 'data');
    const songsPath = path.join(dataDir, 'spotify_data.json');
    const scalerPath = path.join(dataDir, 'scaler_params.json');

    const [songsData, scalerData] = await Promise.all([
        fs.readFile(songsPath, 'utf-8'),
        fs.readFile(scalerPath, 'utf-8')
    ]);

    cachedSongs = JSON.parse(songsData);
    cachedScaler = JSON.parse(scalerData);

    return { songs: cachedSongs!, scaler: cachedScaler! };
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { songs, scaler } = await loadData();

        // Features to use for recommendation
        const features = [
            'bpm', 'danceability_%', 'valence_%', 'energy_%',
            'acousticness_%', 'instrumentalness_%', 'liveness_%', 'speechiness_%'
        ];

        // Map frontend keys to dataset keys
        const inputMapping: { [key: string]: string } = {
            bpm: 'bpm',
            danceability: 'danceability_%',
            valence: 'valence_%',
            energy: 'energy_%',
            acousticness: 'acousticness_%',
            instrumentalness: 'instrumentalness_%',
            liveness: 'liveness_%',
            speechiness: 'speechiness_%'
        };

        // Scale user input
        const scaledInput: { [key: string]: number } = {};
        features.forEach(feature => {
            const inputKey = Object.keys(inputMapping).find(key => inputMapping[key] === feature);
            if (inputKey) {
                const rawValue = body[inputKey];
                const mean = scaler.mean[feature];
                const scale = scaler.scale[feature];
                scaledInput[feature] = (rawValue - mean) / scale;
            }
        });

        // Calculate Euclidean distance
        const recommendations = songs.map(song => {
            let distance = 0;
            features.forEach(feature => {
                const songValue = song[feature];
                const userValue = scaledInput[feature];
                distance += Math.pow(songValue - userValue, 2);
            });
            distance = Math.sqrt(distance);

            return {
                ...song,
                distance
            };
        });

        // Sort by distance (ascending)
        recommendations.sort((a, b) => a.distance - b.distance);

        // Get top 5
        const top5 = recommendations.slice(0, 5).map(song => ({
            track_name: song.track_name,
            artist_name: song['artist(s)_name'],
            year: song.released_year,
            spotify_link: `https://open.spotify.com/search/${encodeURIComponent(song.track_name + ' ' + song['artist(s)_name'])}`,
            match_score: `${Math.max(0, 100 - Math.round(song.distance * 10))}%` // Rough score approximation
        }));

        return NextResponse.json({ recommendations: top5 });

    } catch (error) {
        console.error('Recommendation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
