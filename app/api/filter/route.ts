import { NextRequest, NextResponse } from 'next/server';
import { shouldBlockContent } from '@/utils/contentFilter';
import { AgeGroup, CustomParentControl } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, content, ageGroup, customControls, metadata } = body;

    // Validate required fields
    if (!url || !ageGroup) {
      return NextResponse.json(
        { error: 'Missing required fields: url, ageGroup' },
        { status: 400 }
      );
    }

    // Validate age group
    const validAgeGroups: AgeGroup[] = ['UNDER_10', 'AGE_10_13', 'AGE_13_16', 'AGE_16_18', 'AGE_18_PLUS'];
    if (!validAgeGroups.includes(ageGroup)) {
      return NextResponse.json(
        { error: 'Invalid age group' },
        { status: 400 }
      );
    }

    // Process custom controls
    const controls: CustomParentControl[] = customControls || [];

    // Filter content
    const result = shouldBlockContent(
      url,
      content || '',
      ageGroup,
      controls,
      metadata
    );

    return NextResponse.json({
      blocked: result.blocked,
      action: result.action,
      categoryId: result.categoryId,
      contentTypeId: result.contentTypeId,
      reason: result.reason,
    });
  } catch (error) {
    console.error('Error filtering content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

