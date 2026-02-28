package com.studysphere.post.repository;

import com.studysphere.post.model.CommunityMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommunityMemberRepository extends JpaRepository<CommunityMember, Long> {
    boolean existsByCommunityIdAndStudentId(Long communityId, Long studentId);
}