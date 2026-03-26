"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function Swagger({ spec }: { spec: any }) {
  return (
    <div className="swagger-container">
      <SwaggerUI spec={spec} />
      <style jsx global>{`
        .swagger-ui .topbar { display: none; }
      `}</style>
    </div>
  );
}
