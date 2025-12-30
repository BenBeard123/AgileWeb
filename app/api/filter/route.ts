import { NextRequest, NextResponse } from 'next/server';
import { shouldBlockContent } from '@/utils/contentFilter';
import { AgeGroup, CustomParentControl } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Validate request body exists
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a valid object' },
        { status: 400 }
      );
    }

    const { url, content, ageGroup, customControls, metadata } = body;

    // Validate required fields
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid required field: url' },
        { status: 400 }
      );
    }

    if (!ageGroup || typeof ageGroup !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid required field: ageGroup' },
        { status: 400 }
      );
    }

    // Validate age group
    const validAgeGroups: AgeGroup[] = ['UNDER_10', 'AGE_10_13', 'AGE_13_16', 'AGE_16_18', 'AGE_18_PLUS'];
    if (!validAgeGroups.includes(ageGroup)) {
      return NextResponse.json(
        { error: `Invalid age group. Must be one of: ${validAgeGroups.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate and sanitize custom controls
    let controls: CustomParentControl[] = [];
    if (customControls) {
      if (!Array.isArray(customControls)) {
        return NextResponse.json(
          { error: 'customControls must be an array' },
          { status: 400 }
        );
      }
      controls = customControls.filter((control: any) => {
        return (
          control &&
          typeof control === 'object' &&
          ['interest', 'url', 'keyword'].includes(control.type) &&
          typeof control.value === 'string' &&
          control.value.trim().length > 0 &&
          ['BLOCK', 'GATE', 'ALLOW'].includes(control.action)
        );
      }).slice(0, 100); // Limit to 100 controls
    }

    // Validate metadata if provided
    let safeMetadata: { title?: string; description?: string } | undefined;
    if (metadata) {
      if (typeof metadata !== 'object') {
        return NextResponse.json(
          { error: 'metadata must be an object' },
          { status: 400 }
        );
      }
      safeMetadata = {
        title: typeof metadata.title === 'string' ? metadata.title.slice(0, 500) : undefined,
        description: typeof metadata.description === 'string' ? metadata.description.slice(0, 1000) : undefined,
      };
    }

    // Sanitize URL and content
    const sanitizedUrl = url.trim().slice(0, 2000);
    const sanitizedContent = typeof content === 'string' ? content.slice(0, 10000) : '';

    // Filter content
    const result = shouldBlockContent(
      sanitizedUrl,
      sanitizedContent,
      ageGroup,
      controls,
      safeMetadata
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
    // Don't expose internal error details
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

