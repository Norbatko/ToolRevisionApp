import { formatDate } from "@/lib/utils";
import type { Revision, Tool, ToolType } from "@/types";

interface RevisionPrintViewProps {
  revision: Revision;
  tool: Tool;
  toolType: ToolType;
}

export function RevisionPrintView({ revision, tool, toolType }: RevisionPrintViewProps) {
  const checkFields = [...toolType.checkFields].sort((a, b) => a.order - b.order);
  const parts = [...toolType.parts].sort((a, b) => a.order - b.order);

  return (
    <div className="print-content font-sans text-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="font-bold text-base underline">Technický doklad</h1>
          <p className="mt-1">Kontaktní osoba: <strong>{revision.technicianName}</strong></p>
          <p>Telefon: {revision.technicianPhone}</p>
          <p>E-Mail: {revision.technicianEmail}</p>
        </div>
        <div className="text-right text-xs border border-gray-400 p-2">
          <p>{tool.identifier}</p>
        </div>
      </div>

      {/* Tool info */}
      <div className="border border-gray-400 mb-4">
        <div className="bg-gray-100 px-3 py-1 text-center font-semibold uppercase text-xs tracking-wide border-b border-gray-400">
          {toolType.name}
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-400 text-xs">
          <div className="px-3 py-1.5">
            <span className="text-gray-500">Sériové číslo:</span>{" "}
            <strong>{tool.serialNumber}</strong>
          </div>
          <div className="px-3 py-1.5">
            <span className="text-gray-500">Model:</span>{" "}
            <strong>{tool.model}</strong>
          </div>
          <div className="px-3 py-1.5">
            <span className="text-gray-500">Rok výroby:</span>{" "}
            <strong>{tool.yearOfManufacture}</strong>
          </div>
        </div>
      </div>

      {/* Revision table */}
      <div className="border border-gray-400 mb-4">
        <div className="grid grid-cols-2 border-b border-gray-400">
          <div className="px-3 py-1.5 text-xs font-semibold">
            Datum revize: {formatDate(revision.revisionDate)}
          </div>
          <div className="px-3 py-1.5 text-xs font-semibold text-right">
            {revision.overallResult === "splňuje" ? (
              <span>✓ SPLŇUJE</span>
            ) : (
              <span>✗ NESPLŇUJE</span>
            )}
          </div>
        </div>

        {/* Check fields */}
        {checkFields.length > 0 && (
          <div className="border-b border-gray-400">
            <div className="grid divide-y divide-gray-200">
              {checkFields.map((field) => {
                const val = revision.checkResults[field.id];
                return (
                  <div key={field.id} className="grid grid-cols-2 px-3 py-1.5 text-xs">
                    <span className="text-gray-600">{field.name}</span>
                    <span className="font-medium">
                      {field.type === "yes_no"
                        ? val ? "Ano" : "Ne"
                        : String(val ?? "—")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Parts assessment */}
        {parts.length > 0 && (
          <div>
            <div className="px-3 py-1.5 bg-gray-50 text-xs font-semibold border-b border-gray-300 uppercase tracking-wide">
              Poškození – závada
            </div>
            {parts.map((part) => {
              const result = revision.partsResults[part.id];
              return (
                <div key={part.id} className="grid grid-cols-3 px-3 py-1.5 text-xs border-t border-gray-200">
                  <span className="font-medium">{part.name}</span>
                  <span className={result?.hasIssue ? "text-red-600" : "text-green-600"}>
                    {result?.hasIssue ? "Ne (závada)" : "Ano"}
                  </span>
                  <span className="text-gray-500">{result?.note ?? ""}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes */}
      {revision.notes && (
        <div className="mb-4">
          <p className="text-xs font-semibold mb-1">Poznámky:</p>
          <p className="text-xs text-gray-700 border border-gray-300 rounded p-2">{revision.notes}</p>
        </div>
      )}

      {/* Signature */}
      <div className="flex justify-end mt-6">
        <div className="text-center text-xs">
          <div className="w-40 border-b border-gray-600 pb-1 mb-1">
            <span className="font-semibold">REVIZI PROVEDL</span>
          </div>
          <div className="w-40 h-8" />
          <p className="text-gray-400">podpis</p>
        </div>
      </div>
    </div>
  );
}
