package com.billionaire.global.validation;

import jakarta.validation.groups.Default;

/**
 * Bean Validation을 위한 검증 그룹
 * 
 * 이 마커 인터페이스들은 수행되는 작업에 따라
 * 동일한 엔터티에 적용할 수 있는 다양한 검증 컨텍스트를 정의합니다.
 * 
 * 그룹 상속을 통해 유연한 검증 시나리오를 제공합니다:
 * - Default 그룹은 명시적으로 제외되지 않는 한 항상 적용됩니다
 * - Create는 Default를 확장하여 기본 검증을 포함합니다
 * - Update는 Create와 다른 요구사항을 가질 수 있습니다
 * - PartialUpdate는 선택적 필드에 대한 완화된 검증을 허용합니다
 */
public class ValidationGroups {
    
    /**
     * 생성 작업을 위한 검증 그룹
     * Default를 확장하여 기본 필드 검증을 포함합니다
     */
    public interface Create extends Default {}
    
    /**
     * 수정 작업을 위한 검증 그룹
     * Create와 다른 검증 규칙을 가질 수 있습니다
     */
    public interface Update extends Default {}
    
    /**
     * 삭제 작업을 위한 검증 그룹
     * 일반적으로 ID 검증만 필요합니다
     */
    public interface Delete {}
    
    /**
     * 부분 수정 작업을 위한 검증 그룹 (PATCH)
     * 필드가 선택적인 완화된 검증을 허용합니다
     */
    public interface PartialUpdate {}
    
    /**
     * 관리자 작업을 위한 검증 그룹
     * 다른 또는 추가적인 검증 규칙을 가질 수 있습니다
     */
    public interface Admin {}
}