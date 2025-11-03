// Utility helpers to build template payload for backend

export function readTemplateMetaFromStorage() {
  try {
    const raw = localStorage.getItem('templateInfo');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        name: parsed.name || '',
        description: parsed.description || '',
        departmentId: parsed.departmentId || '',
        templateContent: parsed.templateContent || ''
      };
    }
  } catch {
    // ignore parse errors and fall back to individual keys
  }

  return {
    name: localStorage.getItem('templateName') || '',
    description: localStorage.getItem('templateDesc') || '',
    departmentId: localStorage.getItem('departmentId') || '',
    templateContent: localStorage.getItem('templateContent') || ''
  };
}

export function buildTemplatePayload(meta, sections) {
  const normalizedSections = (sections || []).map((section, sIdx) => {
    const rawFields = section.fields || [];
    // Ensure PART fields have a stable tempId and children reference that tempId
    const partIdMap = {};
    for (const f of rawFields) {
      if (String(f.fieldType || '').toUpperCase() === 'PART') {
        const name = f.fieldName || '';
        const ensuredTempId = f.tempId || (name ? `${name}-parent` : undefined);
        if (ensuredTempId) partIdMap[name] = ensuredTempId;
      }
    }

    // Normalize children to point to PART tempIds when they referenced fieldName
    const normalized = rawFields.map((f) => {
      const parent = f.parentTempId;
      if (parent && partIdMap[parent]) {
        return { ...f, parentTempId: partIdMap[parent] };
      }
      return f;
    });

    // Compute visual order as rendered in UI: top-level by array order, then PART children right after their PART
    const indexed = normalized.map((f, i) => ({ ...f, __idx: i }));
    const topLevel = indexed
      .filter((f) => !f.parentTempId)
      .sort((a, b) => a.__idx - b.__idx);

    const inVisualOrder = [];
    for (const top of topLevel) {
      inVisualOrder.push(top);
      const pid = (String(top.fieldType || '').toUpperCase() === 'PART')
        ? (top.tempId || partIdMap[top.fieldName] || (top.fieldName ? `${top.fieldName}-parent` : undefined))
        : null;
      if (pid) {
        const children = indexed
          .filter((f) => f.parentTempId === pid)
          .sort((a, b) => a.__idx - b.__idx);
        inVisualOrder.push(...children);
      }
    }

    // Fallback: if some items were not included (edge cases), append them by array order
    if (inVisualOrder.length !== indexed.length) {
      const seen = new Set(inVisualOrder.map((f) => f.__idx));
      indexed
        .filter((f) => !seen.has(f.__idx))
        .sort((a, b) => a.__idx - b.__idx)
        .forEach((f) => inVisualOrder.push(f));
    }

    const fields = inVisualOrder.map((f, fIdx) => {
      const isSignature = String(f.fieldType || '').toUpperCase().startsWith('SIGNATURE');
      const base = {
        label: f.label,
        fieldName: f.fieldName,
        fieldType: f.fieldType,
        displayOrder: fIdx + 1,
        parentTempId: f.parentTempId ? f.parentTempId : null
      };
      if (isSignature) {
        base.roleRequired = f.roleRequired || 'TRAINER';
      }
      if (String(f.fieldType || '').toUpperCase() === 'PART') {
        // ensure PART tempId exists and is stable
        const name = f.fieldName || '';
        base.tempId = f.tempId || (name ? `${name}-parent` : undefined);
      }
      return base;
    });

    return {
      name: section.name,
      label: section.label,
      displayOrder: section.displayOrder ?? (sIdx + 1),
      editBy: section.editBy || 'TRAINER',
      roleInSubject: section.roleInSubject ? section.roleInSubject : null,
      isSubmittable: Boolean(section.isSubmittable),
      isToggleDependent: Boolean(section.isToggleDependent),
      fields
    };
  });

  // Build top-level with explicit key order
  return {
    name: meta.name,
    description: meta.description,
    departmentId: meta.departmentId,
    templateContent: meta.templateContent,
    templateConfig: meta.templateConfig || null,
    sections: normalizedSections
  };
}


