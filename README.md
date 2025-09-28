# 🎉 E-commerce Minimalista

## ✅ Check-list

### 1. Modelado de datos
- Esquema Prisma completo: `User`, `Product`, `Order`, `Cart`, `Category`, `Payment`, `FileUpload`, `Review`

### 2. Autenticación y autorización
- NextAuth.js con roles `BUYER` | `ADMIN`
- Middleware que protege rutas según rol
- Registro / inicio de sesión responsive

### 3. Experiencia de compra
- **Homepage**: hero, grid de destacados, highlights de la marca
- **Catálogo**: búsqueda, filtros por categoría, ordenamientos, paginación
- **PDP**: galería, selector de talla/color, reviews
- **Carrito**: estado persistente vía Zustand, control de cantidades, resumen de pedido
- **Checkout**: stepper de 4 pasos (envío → pago → revisión → confirmación)
- **Pedidos**: historial del cliente, seguimiento de estado, subida de comprobantes

### 4. Gestión de archivos
- Drag-&-drop para comprobantes
- Validación de tipo y tamaño
- Descarga y borrado seguros (solo admin o propietario)

### 5. Panel de administración
- Dashboard con KPIs (ventas, usuarios, stock)
- ABM de productos con control de inventario
- Gestión de ordenes: cambio de estado, vista de archivos subidos
- Monitor de sistema en tiempo real

### 6. Diseño y usabilidad
- Mobile-first, breakpoints fluidos
- Menú hamburger, botones táctiles, tipografía optimizada
- Micro-interacciones: hover, skeletons, focus visible
- Accesibilidad WCAG: ARIA labels, navegación por teclado

### 7. Stack técnico
| Capa              | Tecnología                                      |
|-------------------|-------------------------------------------------|
| Frontend          | Next.js 15 ‑ React 19 ‑ TypeScript 5          |
| Estilos           | Tailwind CSS 4 – shadcn/ui                    |
| Estado cliente    | Zustand (carrito)                             |
| Auth              | NextAuth.js v4 (JWT)                          |
| Base de datos     | SQLite + Prisma ORM                           |
| Almacén de archivos | Disco local con validación                    |
| Calidad de código | ESLint limpio, tipado estricto, sin `any`     |

### 8. Seguridad
- Control de acceso por rol + middleware
- Validación de entrada (zod / Yup en endpoints)
- Límites de tamaño y tipos MIME en uploads
- Gestión segura de sesiones (JWT firmado, http-only cookie)

### 9. Performance
- Imágenes optimizadas con `next/image`
- Code-splitting automático de Next.js
- Skeletons y estados de carga progresiva
- Cacheo de consultas frecuentes (React + Prisma)

### 10. Compatibilidad
- Chrome, Firefox, Safari, Edge (últimas 2 versiones)
- PWA listo (manifest + service worker básico)
- Lighthouse &gt; 90 en Performance y Accesibilidad

---

## 🚀 Cómo levantar el proyecto localmente

```bash
# 1. Clonar repo
git clone https://github.com/tu-usuario/tienda-ropa.git
cd tienda-ropa

# 2. Instalar dependencias
npm install

# 3. Variables de entorno
cp .env.example .env
# Rellena DATABASE_URL y NEXTAUTH_SECRET

# 4. Base de datos
npx prisma migrate dev
npx prisma db seed   # opcional: datos de prueba

# 5. Arrancar
npm run dev

## Levantar en local
1. Clona el repo
2. `cp .env.example .env`
3. `npm install`
4. `npx prisma migrate dev`
5. (Opcional) `npx prisma db seed` si necesitas datos de prueba
6. `npm run dev`

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

# minimalist-ecommerce
