'use client';

import React from 'react';
import CreateOrEditPostModal from '@/components/feed-post/CreateOrEditPostModal';
import { Expenditure } from '@/types/expenditure';
import { CampaignDto } from '@/types/campaign';

interface FeedPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    postExpenditure: Expenditure | null;
    campaign: CampaignDto | null;
    currentDraftPost: any;
    itemMedia: Record<number, any[]>;
    fetchData: () => void;
}

const FeedPostModal: React.FC<FeedPostModalProps> = ({
    isOpen,
    onClose,
    postExpenditure,
    campaign,
    currentDraftPost,
    itemMedia,
    fetchData
}) => {
    if (!isOpen || !postExpenditure || !campaign) return null;

    const evidencePhotos = (postExpenditure.items || [])
        .flatMap(item => itemMedia[item.id] || [])
        .map(media => ({ url: media.url, id: media.id, type: 'image' }));

    return (
        <CreateOrEditPostModal
            isOpen={isOpen}
            onClose={onClose}
            campaignsList={[{ id: campaign.id, title: campaign.title }]}
            campaignTitlesMap={{ [campaign.id]: campaign.title }}
            initialData={currentDraftPost ? {
                ...currentDraftPost,
                attachments: (currentDraftPost.attachments && currentDraftPost.attachments.length > 0)
                    ? currentDraftPost.attachments
                    : evidencePhotos,
                author: { id: String(currentDraftPost.authorId || ''), name: '', avatar: '' },
                liked: false,
                comments: [],
                likeCount: currentDraftPost.likeCount || 0,
                replyCount: currentDraftPost.replyCount || 0,
                viewCount: currentDraftPost.viewCount || 0,
                isPinned: currentDraftPost.isPinned || false,
                isLocked: currentDraftPost.isLocked || false,
                flagged: false,
            } : {
                id: undefined as unknown as string,
                author: { id: '', name: '', avatar: '' },
                liked: false,
                comments: [],
                likeCount: 0,
                replyCount: 0,
                viewCount: 0,
                isPinned: false,
                isLocked: false,
                flagged: false,
                title: `Cập nhật minh chứng chi tiêu: ${campaign.title}`,
                content: `Tôi vừa hoàn thành chi tiêu cho chiến dịch "${campaign.title}". Mời mọi người cùng theo dõi!`,
                type: 'DISCUSSION',
                visibility: 'PUBLIC',
                status: 'DRAFT',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                targetId: postExpenditure.id,
                targetType: 'EXPENDITURE',
                targetName: 'evidence',
                attachments: evidencePhotos,
            }}
            draftMode={true}
            onPostCreated={() => {
                onClose();
                fetchData();
            }}
            onPostUpdated={() => {
                onClose();
                fetchData();
            }}
        />
    );
};

export default FeedPostModal;
