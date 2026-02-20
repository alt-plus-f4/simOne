import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const track = searchParams.get('track');
	const artist = searchParams.get('artist');
	const q = searchParams.get('q');

	if (!track && !q) {
		return NextResponse.json({ error: 'track or q parameter required' }, { status: 400 });
	}

	try {
		let lrclibUrl: string;

		if (track && artist) {
			lrclibUrl = `https://lrclib.net/api/search?track_name=${encodeURIComponent(track)}&artist_name=${encodeURIComponent(artist)}`;
		} else {
			const searchTerm = q || track || '';
			lrclibUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(searchTerm)}`;
		}

		const res = await fetch(lrclibUrl, {
			headers: {
				'User-Agent': 'SimOne/1.0.0 (https://SimOne.app)',
			},
		});

		if (!res.ok) {
			return NextResponse.json({ lyrics: null, error: 'Lyrics not found' }, { status: 404 });
		}

		const data = await res.json();

		if (!Array.isArray(data) || data.length === 0) {
			return NextResponse.json({ lyrics: null, lines: [] });
		}

		// Get the first result with plain lyrics
		const match = data.find((item: { plainLyrics?: string }) => item.plainLyrics) || data[0];

		const plainLyrics = match.plainLyrics || '';
		const lines = plainLyrics
			.split('\n')
			.map((line: string) => line.trim())
			.filter((line: string) => line.length > 0);

		return NextResponse.json({
			lyrics: plainLyrics,
			lines,
			trackName: match.trackName || '',
			artistName: match.artistName || '',
		});
	} catch (error) {
		console.error('Lyrics API error:', error);
		return NextResponse.json({ lyrics: null, lines: [], error: 'Failed to fetch lyrics' }, { status: 500 });
	}
}
