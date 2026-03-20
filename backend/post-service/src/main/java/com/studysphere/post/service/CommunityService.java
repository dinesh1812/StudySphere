package com.studysphere.post.service;

import com.studysphere.post.dto.CommunityRequest;
import com.studysphere.post.model.Community;
import com.studysphere.post.model.CommunityMember;
import com.studysphere.post.repository.CommunityMemberRepository;
import com.studysphere.post.repository.CommunityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository communityMemberRepository;

    @Transactional
    public Community createCommunity(CommunityRequest request) {
        if (communityRepository.existsByName(request.getName())) {
            throw new RuntimeException("A community with this name already exists.");
        }

        Community community = new Community();
        community.setName(request.getName());
        community.setDescription(request.getDescription());
        community.setCreatedBy(request.getAuthorId());
        
        // Save the community
        Community savedCommunity = communityRepository.save(community);

        // Directly add creator as the first member (more robust)
        CommunityMember member = new CommunityMember();
        member.setCommunityId(savedCommunity.getId());
        member.setStudentId(request.getAuthorId());
        communityMemberRepository.save(member);

        return savedCommunity;
    }

    @Transactional
    public String joinCommunity(Long communityId, Long studentId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Community not found."));

        if (communityMemberRepository.existsByCommunityIdAndStudentId(communityId, studentId)) {
            throw new RuntimeException("You are already a member of this community.");
        }

        CommunityMember member = new CommunityMember();
        member.setCommunityId(communityId);
        member.setStudentId(studentId);
        communityMemberRepository.save(member);

        return "Successfully joined " + community.getName();
    }
    
    public List<Community> getAllCommunities() {
        return communityRepository.findAll();
    }

    public List<Community> getJoinedCommunities(Long studentId) {
        return communityRepository.findByStudentId(studentId);
    }

    public List<Long> getJoinedCommunityIds(Long studentId) {
        return communityMemberRepository.findCommunityIdsByStudentId(studentId);
    }

    @Transactional
    public void leaveCommunity(Long communityId, Long studentId) {
        if (!communityMemberRepository.existsByCommunityIdAndStudentId(communityId, studentId)) {
            throw new RuntimeException("You are not a member of this community.");
        }
        communityMemberRepository.deleteByCommunityIdAndStudentId(communityId, studentId);
    }

    @Transactional
    public void deleteCommunity(Long communityId, Long userId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Community not found."));
        
        // Security Check: Only the creator can delete
        if (!community.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Unauthorized: Only the community creator can delete this community.");
        }

        // 1. Delete all membership records
        communityMemberRepository.deleteByCommunityId(communityId);
        
        // 2. Delete the community itself
        communityRepository.delete(community);
    }

    public List<CommunityMember> getCommunityMembers(Long communityId) {
        return communityMemberRepository.findByCommunityId(communityId);
    }

    @Transactional
    public void removeMember(Long communityId, Long creatorId, Long targetStudentId) {
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new RuntimeException("Community not found."));

        if (!community.getCreatedBy().equals(creatorId)) {
            throw new RuntimeException("Unauthorized: Only the community creator can remove members.");
        }

        if (creatorId.equals(targetStudentId)) {
            throw new RuntimeException("You cannot remove yourself from your own community. Delete the community instead.");
        }

        communityMemberRepository.deleteByCommunityIdAndStudentId(communityId, targetStudentId);
    }
}