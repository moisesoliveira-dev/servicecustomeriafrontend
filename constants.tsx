
import React from 'react';
import { ExecutionLog } from './types';

export const INTEGRATIONS_LIST = [
  {
    id: 'google-drive',
    name: 'Google Drive Asset',
    type: 'STORAGE_NODE',
    icon: '📂',
    configFields: [
      { label: 'Client ID', key: 'clientId', type: 'text', placeholder: 'OAuth Client ID' },
      { label: 'Client Secret', key: 'clientSecret', type: 'password', placeholder: '••••••••' },
      { label: 'Node Path', key: 'folderId', type: 'text', placeholder: 'Root Directory ID' }
    ]
  },
  {
    id: 'pontta',
    name: 'Pontta Core',
    type: 'CRM_NODE',
    icon: '⚡',
    configFields: [
      { label: 'Security Token', key: 'apiKey', type: 'password', placeholder: 'Bearer API Token' },
      { label: 'Endpoint Cluster', key: 'baseUrl', type: 'text', placeholder: 'https://api.pontta.cloud/v2' }
    ]
  },
  {
    id: 'slack',
    name: 'Slack Internal',
    type: 'NOTIF_NODE',
    icon: '💬',
    configFields: [
      { label: 'Hook URI', key: 'webhookUrl', type: 'text', placeholder: 'https://hooks.slack.com/services/...' }
    ]
  }
];

export const MOCK_INPUT_JSON = {
  header: {
    source: "EXTERNAL_CRM_01",
    timestamp: 1715632000
  },
  payload: {
    subject_id: "USER_88291",
    label: "John Doe",
    contact_point: "john.d@enterprise.com",
    body: "Authentication failure on Node-4"
  }
};

export const MOCK_INTERNAL_SCHEMA = [
  "nexus_uid",
  "client_label",
  "client_origin",
  "intent_class",
  "severity_index",
  "normalized_body"
];

export const MOCK_EXECUTIONS: ExecutionLog[] = [
  {
    id: 'EXE-9001',
    sessionId: 'SES-88221',
    timestamp: '2024-05-14 14:30:11',
    duration: '1.2s',
    status: 'SUCCESS',
    steps: [
      { name: 'Ingest (Salesforce)', status: 'COMPLETED', timestamp: '14:30:11.002', payloadIn: { raw_lead_id: '00Q8d000028x4dEIAQ' }, payloadOut: { internal_id: 'NEX-123', customer_email: 'john.doe@salesforce.com' } },
      { name: 'AI Transformer', status: 'COMPLETED', timestamp: '14:30:11.450', payloadIn: { internal_id: 'NEX-123' }, payloadOut: { intent: 'billing_inquiry', priority: 5, language: 'en-US' } },
      { name: 'Global Router', status: 'COMPLETED', timestamp: '14:30:11.800', payloadIn: { intent: 'billing_inquiry' }, payloadOut: { next_hop: 'AGENT_SLACK' } },
      { name: 'Slack Worker', status: 'COMPLETED', timestamp: '14:30:12.150', payloadIn: { channel: '#billing', message: 'New inquiry from john.doe...' }, payloadOut: { slack_ts: '1715711412.000100' } },
      { name: 'Output Webhook', status: 'COMPLETED', timestamp: '14:30:12.201', payloadIn: { status: 'acknowledged' }, payloadOut: { status: 200 } }
    ]
  },
  {
    id: 'EXE-9002',
    sessionId: 'SES-88225',
    timestamp: '2024-05-14 14:35:05',
    duration: '0.8s',
    status: 'FAILURE',
    steps: [
      { name: 'Ingest (Hubspot)', status: 'COMPLETED', timestamp: '14:35:05.100', payloadIn: { vid: 101, properties: {} }, payloadOut: { internal_id: 'NEX-124' } },
      { name: 'AI Transformer', status: 'FAILED', timestamp: '14:35:05.900', payloadIn: { internal_id: 'NEX-124' }, payloadOut: { error: 'Invalid API Key mapping', details: 'The provided HubSpot API key is either expired or lacks required permissions.' } }
    ]
  },
  {
    id: 'EXE-9003',
    sessionId: 'SES-88230',
    timestamp: '2024-05-14 14:41:12',
    duration: '2.5s',
    status: 'SUCCESS',
    steps: [
      { name: 'Ingest (Custom)', status: 'COMPLETED', timestamp: '14:41:12.200', payloadIn: { auth_token: 'secret', data: '...' }, payloadOut: { internal_id: 'NEX-125' } },
      { name: 'AI Transformer', status: 'COMPLETED', timestamp: '14:41:12.900', payloadIn: { internal_id: 'NEX-125' }, payloadOut: { intent: 'technical_support', priority: 9 } },
      { name: 'Global Router', status: 'COMPLETED', timestamp: '14:41:13.500', payloadIn: { intent: 'technical_support' }, payloadOut: { next_hop: 'AGENT_GDRIVE' } },
      { name: 'Google Drive Worker', status: 'COMPLETED', timestamp: '14:41:14.300', payloadIn: { action: 'search', query: 'error_log_NEX-125' }, payloadOut: { file_found: true, file_id: '1a2b3c...' } },
      { name: 'Output Webhook', status: 'COMPLETED', timestamp: '14:41:14.700', payloadIn: { status: 'resolved' }, payloadOut: { status: 200 } }
    ]
  },
  {
    id: 'EXE-9004',
    sessionId: 'SES-88231',
    timestamp: '2024-05-14 14:42:01',
    duration: '0.2s',
    status: 'SUCCESS',
    steps: [
      { name: 'Ingest (Salesforce)', status: 'COMPLETED', timestamp: '14:42:01.150', payloadIn: { raw: 'body' }, payloadOut: { internal_id: 'NEX-126' } },
      { name: 'AI Transformer', status: 'COMPLETED', timestamp: '14:42:01.350', payloadIn: { internal_id: 'NEX-126' }, payloadOut: { intent: 'general_question' } }
    ]
  }
];
