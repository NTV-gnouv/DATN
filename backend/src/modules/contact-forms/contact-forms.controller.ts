import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { Public } from '@/shared/decorators/public.decorator';
import { ContactFormsService } from './contact-forms.service';

@ApiTags('Contact Forms')
@ApiBearerAuth()
@Controller('contact-forms')
export class ContactFormsController {
  constructor(private readonly service: ContactFormsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List forms', description: 'Return all contact forms for admin management.' })
  listForms() {
    return this.service.listForms();
  }

  @Get('submissions/all')
  @Public()
  @ApiOperation({ summary: 'List submissions', description: 'Admin endpoint to list all submissions, optionally filtered by form.' })
  listSubmissions(@Query('formId') formId?: string) {
    return this.service.listSubmissions(formId);
  }

  @Delete('submissions/all')
  @Public()
  @ApiOperation({ summary: 'Clear submissions', description: 'Delete all submissions for a form.' })
  clearSubmissions(@Query('formId') formId: string) {
    return this.service.clearSubmissions(formId);
  }

  @Get('submissions/:id')
  @Public()
  @ApiOperation({ summary: 'Get submission', description: 'Admin endpoint to get one submission detail.' })
  getSubmission(@Param('id') id: string) {
    return this.service.getSubmission(id);
  }

  @Delete('submissions/:id')
  @Public()
  @ApiOperation({ summary: 'Delete submission', description: 'Delete one form submission record.' })
  deleteSubmission(@Param('id') id: string) {
    return this.service.deleteSubmission(id);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get form', description: 'Return one contact form definition.' })
  getForm(@Param('id') id: string) {
    return this.service.getForm(id);
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Create form', description: 'Create a new contact form with dynamic field schema.' })
  @ApiBody({ description: 'Contact form payload' })
  createForm(@Body() body: Record<string, unknown>) {
    return this.service.createForm(body);
  }

  @Patch(':id')
  @Public()
  @ApiOperation({ summary: 'Update form', description: 'Update contact form metadata or fields.' })
  @ApiBody({ description: 'Contact form update payload' })
  updateForm(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.service.updateForm(id, body);
  }

  @Post(':id/submit')
  @Public()
  @ApiOperation({ summary: 'Submit form', description: 'Public endpoint for end users to submit a contact form.' })
  @ApiBody({ description: 'Form submission payload where keys match field ids.' })
  submit(@Param('id') id: string, @Body() body: Record<string, unknown>, @Req() request: Request) {
    const ip = request.ip ?? '';
    const userAgent = request.headers['user-agent'] ?? '';
    const pageUrlHeader = request.headers['x-page-url'];
    const pageUrl = Array.isArray(pageUrlHeader) ? pageUrlHeader[0] ?? '' : pageUrlHeader ?? '';

    return this.service.submitForm(id, body, {
      ip: String(ip),
      userAgent: String(userAgent),
      pageUrl: String(pageUrl),
    });
  }
}
