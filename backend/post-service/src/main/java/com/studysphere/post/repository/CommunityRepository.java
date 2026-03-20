package com.studysphere.post.repository;

import com.studysphere.post.model.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long> {
    boolean existsByName(String name);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Community c JOIN CommunityMember cm ON c.id = cm.communityId WHERE cm.studentId = :studentId")
    List<Community> findByStudentId(Long studentId);
}