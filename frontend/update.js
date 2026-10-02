const fs = require('fs');

function processFile(filePath, regexStatusFn, usageFn) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Quitar función local
    content = content.replace(regexStatusFn, '');
    
    // Reemplazar uso
    content = content.replace(usageFn, '<StatusBadge estado={$1} size="sm" />');
    
    // Agregar import
    if (!content.includes('StatusBadge')) {
      content = content.replace('import { Badge } from "@/components/ui/badge";', 
        'import { Badge } from "@/components/ui/badge";\nimport { StatusBadge } from "@/components/shared/status-badge";');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed:', filePath);
  } catch (err) {
    console.error('Error on', filePath, err.message);
  }
}

// fuentes/[id]/page.tsx
processFile(
  'src/app/wireframes2/catalogo-interoperabilidad/administracion/fuentes/[id]/page.tsx',
  /const getEstadoBadge = \(estado: FuenteEstado\) => \{[\s\S]*?^\s*\};\n/m,
  /\{getEstadoBadge\((.*?)\)\}/g
);

// gestion/page.tsx
processFile(
  'src/app/wireframes2/catalogo-interoperabilidad/gestion/page.tsx',
  /const getEstadoBadge = \(estado: FuenteEstado\) => \{[\s\S]*?^\s*\};\n/m,
  /\{getEstadoBadge\((.*?)\)\}/g
);

// novedades/[id]/novedad-detail-client-view.tsx
processFile(
  'src/app/wireframes2/catalogo-interoperabilidad/novedades/[id]/novedad-detail-client-view.tsx',
  /const getBadgeEstado = \(estado: EstadoNovedad\) => \{[\s\S]*?^\s*\};\n/m,
  /\{getBadgeEstado\((.*?)\)\}/g
);

// novedades/page.tsx
processFile(
  'src/app/wireframes2/catalogo-interoperabilidad/novedades/page.tsx',
  /const getBadgeEstado = \(estado: EstadoNovedad\) => \{[\s\S]*?^\s*\};\n/m,
  /\{getBadgeEstado\((.*?)\)\}/g
);

// usuarios/page.tsx
processFile(
  'src/app/wireframes2/usuarios/page.tsx',
  /const getEstadoBadge = \(estado: EstadoUsuario\) => \{[\s\S]*?^\s*\};\n/m,
  /\{getEstadoBadge\((.*?)\)\}/g
);
