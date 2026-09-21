import { PageHeader } from "../../components/common/PageHeader";
import React from 'react';
import { Cpu, Server, CheckCircle2, ShieldCheck, Database, Layers } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const SystemOverviewPage: React.FC = () => {
  const services = [
    { name: 'API Gateway (Port 8080)', status: 'UP', type: 'Spring Cloud Gateway Server WebMVC' },
    { name: 'Eureka Service Discovery (Port 8761)', status: 'UP', type: 'Netflix Eureka Server' },
    { name: 'Auth Service (Port 8081)', status: 'UP', type: 'Spring Security + JWT Authentication' },
    { name: 'Product Service (Port 8082)', status: 'UP', type: 'Spring Data JPA + PostgreSQL Catalog' },
    { name: 'Inventory Service (Port 8083)', status: 'UP', type: 'Pessimistic Locking + Flyway Audit' },
    { name: 'Order Service (Port 8084)', status: 'UP', type: 'OpenFeign Distributed Saga Orchestration' },
  ];

  return (
    <div className="flex flex-col gap-6 text-left max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">System Architecture Overview</h1>
        <p className="text-xs text-slate-400 mt-0.5">Production Spring Boot microservices cluster health & infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((srv, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">{srv.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{srv.type}</p>
              </div>
            </div>
            <Badge variant="success" size="sm">
              {srv.status}
            </Badge>
          </div>
        ))}
      </div>

      <Card title="Infrastructure & Concurrency Safety Protocols">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <ShieldCheck className="w-6 h-6 text-indigo-400 mb-2" />
            <h5 className="font-bold text-slate-200 text-sm">Pessimistic Locks</h5>
            <p className="text-xs text-slate-400 mt-1">PESSIMISTIC_WRITE locks prevent race conditions during order placement.</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <Database className="w-6 h-6 text-emerald-400 mb-2" />
            <h5 className="font-bold text-slate-200 text-sm">PostgreSQL Isolation</h5>
            <p className="text-xs text-slate-400 mt-1">Independent PostgreSQL databases with automated Flyway migrations.</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <Layers className="w-6 h-6 text-sky-400 mb-2" />
            <h5 className="font-bold text-slate-200 text-sm">Eureka Load Balancing</h5>
            <p className="text-xs text-slate-400 mt-1">Dynamic service instance resolution via API Gateway router functions.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
