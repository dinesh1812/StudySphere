package com.studysphere.post.repository;

import com.studysphere.post.model.CommunityMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunityMemberRepository extends JpaRepository<CommunityMember, Long> {
    boolean existsByCommunityIdAndStudentId(Long communityId, Long studentId);
    
    @org.springframework.data.jpa.repository.Query("SELECT cm.communityId FROM CommunityMember cm WHERE cm.studentId = :studentId")
    List<Long> findCommunityIdsByStudentId(Long studentId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByCommunityIdAndStudentId(Long communityId, Long studentId);

    List<CommunityMember> findByCommunityId(Long communityId);

    long countByCommunityId(Long communityId);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void deleteByCommunityId(Long communityId);
}