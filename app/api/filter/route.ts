import { NextRequest, NextResponse } from 'next/server';
import { shouldBlockContent } from '@/utils/contentFilter';
import { shouldBlockContentEnhanced } from '@/utils/enhancedContentFilter';
import { AgeGroup, CustomParentControl, SitePolicy } from '@/types';

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

    const { url, content, ageGroup, customControls, sitePolicies, metadata, useV2 } = body;

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

    // Validate and sanitize site policies if provided (V2)
    let safeSitePolicies: SitePolicy[] | undefined;
    if (useV2 && sitePolicies) {
      if (!Array.isArray(sitePolicies)) {
        return NextResponse.json(
          { error: 'sitePolicies must be an array' },
          { status: 400 }
        );
      }
      safeSitePolicies = sitePolicies.filter((policy: any) => {
        return (
          policy &&
          typeof policy === 'object' &&
          typeof policy.sitePattern === 'string' &&
          ['url', 'app', 'domain'].includes(policy.type) &&
          ['UNDER_10', 'AGE_10_13', 'AGE_13_16', 'AGE_16_18', 'AGE_18_PLUS'].includes(policy.ageGroup) &&
          ['BLOCK', 'GATE', 'ALLOW'].includes(policy.action)
        );
      }).slice(0, 100); // Limit to 100 policies
    }

    // Use V2 enhanced filtering if requested
    if (useV2) {
      const result = shouldBlockContentEnhanced(
        sanitizedUrl,
        sanitizedContent,
        ageGroup,
        controls,
        safeSitePolicies,
        safeMetadata
      );

      return NextResponse.json({
        blocked: result.blocked,
        action: result.action,
        categoryId: result.categoryId,
        contentTypeId: result.contentTypeId,
        contextLabel: result.contextLabel,
        confidence: result.confidence,
        reason: result.reason,
        enhanced: true,
      });
    }

    // Default: use V1 filtering
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
      enhanced: false,
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

