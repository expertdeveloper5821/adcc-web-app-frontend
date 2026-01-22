import React from 'react';
import { useParams } from 'react-router-dom';
import { CommunityCreate } from './CommunityCreate';

export function CommunityEdit() {
  const { id } = useParams<{ id: string }>();
  return <CommunityCreate communityId={id || ''} />;
}
