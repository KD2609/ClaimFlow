package com.orproject.claim.repository;

import com.orproject.claim.model.RPAExecutionLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RPAExecutionLogRepository extends JpaRepository<RPAExecutionLog, Long> {
    Page<RPAExecutionLog> findAllByOrderByTimestampDesc(Pageable pageable);

    List<RPAExecutionLog> findTop10ByOrderByTimestampDesc();
}
