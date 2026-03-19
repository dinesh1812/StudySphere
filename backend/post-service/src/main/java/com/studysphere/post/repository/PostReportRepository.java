package com.studysphere.post.repository;
import com.studysphere.post.model.PostReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostReportRepository extends JpaRepository<PostReport, Long> {
    void deleteByPostId(Long postId); // Used when admin approves a post to clear reports
}