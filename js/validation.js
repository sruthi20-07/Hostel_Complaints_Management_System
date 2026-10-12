/**
 * FIX MY HOSTEL — Form Validation & Duplicate Detection (validation.js)
 * Implements client-side input validation, sanitization, and duplicate complaint checks.
 */

const ValidationRules = {
  TITLE_MIN: 5,
  TITLE_MAX: 120,
  DESC_MIN: 15,
  DESC_MAX: 1000,
  MAX_FILE_SIZE_BYTES: 3 * 1024 * 1024, // 3MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp']
};

class Validator {
  /**
   * Escape HTML special characters for safe output
   */
  static escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Validate Complaint Form
   */
  static validateComplaintForm(data) {
    const errors = {};

    // Title validation
    if (!data.title || !data.title.trim()) {
      errors.title = "Complaint title is required.";
    } else if (data.title.trim().length < ValidationRules.TITLE_MIN) {
      errors.title = `Title must be at least ${ValidationRules.TITLE_MIN} characters.`;
    } else if (data.title.trim().length > ValidationRules.TITLE_MAX) {
      errors.title = `Title cannot exceed ${ValidationRules.TITLE_MAX} characters.`;
    }

    // Category validation
    const validCategories = [
      'Plumbing', 'Electricity', 'Cleaning', 'Wi-Fi', 
      'Furniture', 'Security', 'Water Supply', 'Other'
    ];
    if (!data.category || !validCategories.includes(data.category)) {
      errors.category = "Please select a valid complaint category.";
    }

    // Block validation
    const validBlocks = ['Block A', 'Block B', 'Block C', 'Block D', 'PG Block', 'Mess Block'];
    if (!data.block || !validBlocks.includes(data.block)) {
      errors.block = "Please select your hostel block.";
    }

    // Floor validation
    if (!data.floor || !data.floor.trim()) {
      errors.floor = "Please select a floor.";
    }

    // Room validation (required unless common area)
    if (!data.isCommonArea && (!data.room || !data.room.trim())) {
      errors.room = "Room number is required for personal room issues.";
    }

    // Description validation
    if (!data.description || !data.description.trim()) {
      errors.description = "Detailed description is required.";
    } else if (data.description.trim().length < ValidationRules.DESC_MIN) {
      errors.description = `Description must be at least ${ValidationRules.DESC_MIN} characters to help staff understand.`;
    } else if (data.description.trim().length > ValidationRules.DESC_MAX) {
      errors.description = `Description cannot exceed ${ValidationRules.DESC_MAX} characters.`;
    }

    // Priority validation
    const validPriorities = ['Low', 'Medium', 'High', 'Emergency'];
    if (!data.priority || !validPriorities.includes(data.priority)) {
      errors.priority = "Please select a priority level.";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate Notice Form (Warden)
   */
  static validateNoticeForm(data) {
    const errors = {};

    if (!data.title || data.title.trim().length < 4) {
      errors.title = "Notice title must be at least 4 characters.";
    }

    if (!data.description || data.description.trim().length < 10) {
      errors.description = "Notice description must be at least 10 characters.";
    }

    if (!data.category) {
      errors.category = "Please select a category.";
    }

    if (data.expiresAt) {
      const expDate = new Date(data.expiresAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(expDate.getTime())) {
        errors.expiresAt = "Invalid expiry date.";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Detect duplicate or very similar open complaints
   * Checks block, category, room/location, and word similarity
   */
  static checkForDuplicates(newComplaint, existingComplaints) {
    if (!Array.isArray(existingComplaints) || existingComplaints.length === 0) {
      return { hasDuplicate: false, duplicates: [] };
    }

    const normalizeWords = text => {
      if (!text) return [];
      return text.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !['the', 'and', 'not', 'for', 'with', 'from', 'room', 'hostel'].includes(w));
    };

    const newWords = new Set(normalizeWords(newComplaint.title + " " + newComplaint.description));
    const openStatuses = ['Submitted', 'Acknowledged', 'In Progress', 'Reopened', 'Overdue'];

    const matched = existingComplaints.filter(existing => {
      // Only compare against active open issues
      if (!openStatuses.includes(existing.status)) return false;

      // 1. Same block AND category match
      const sameBlock = existing.block && newComplaint.block && 
        existing.block.trim().toLowerCase() === newComplaint.block.trim().toLowerCase();
      
      const sameCategory = existing.category && newComplaint.category && 
        existing.category.trim().toLowerCase() === newComplaint.category.trim().toLowerCase();

      if (!sameBlock || !sameCategory) return false;

      // 2. Check room or common area match
      let locationMatch = false;
      if (newComplaint.isCommonArea && existing.isCommonArea) {
        // Both are common areas in the same block/floor
        if (existing.floor === newComplaint.floor) {
          locationMatch = true;
        }
      } else if (newComplaint.room && existing.room) {
        const normExistingRoom = existing.room.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normNewRoom = newComplaint.room.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normExistingRoom && normNewRoom && normExistingRoom === normNewRoom) {
          locationMatch = true;
        }
      }

      // 3. Keyword similarity check (Jaccard-like overlap)
      const existingWords = normalizeWords(existing.title + " " + existing.description);
      let sharedCount = 0;
      existingWords.forEach(w => {
        if (newWords.has(w)) sharedCount++;
      });

      const keywordOverlapRatio = sharedCount / Math.max(1, Math.min(newWords.size, existingWords.length));

      // Match if location matches OR if keyword overlap is high (> 40%) in the same block & category
      return locationMatch || keywordOverlapRatio >= 0.4;
    });

    return {
      hasDuplicate: matched.length > 0,
      duplicates: matched
    };
  }

  /**
   * Validate image file size and MIME type
   */
  static validateImageFile(file) {
    if (!file) return { isValid: true };

    if (!ValidationRules.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: "Only JPG, PNG, and WebP images are allowed."
      };
    }

    if (file.size > ValidationRules.MAX_FILE_SIZE_BYTES) {
      return {
        isValid: false,
        error: `Image size must be less than ${ValidationRules.MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB.`
      };
    }

    return { isValid: true };
  }
}

window.Validator = Validator;
