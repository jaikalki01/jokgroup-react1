
import AdminLayout from '@/components/admin/AdminLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatsCard from '@/components/admin/cards/StatsCard';
import MonthlyChart from '@/components/admin/charts/MonthlyChart';
import WeeklyChart from '@/components/admin/charts/WeeklyChart';
import CategoryChart from '@/components/admin/charts/CategoryChart';
import CustomerChart from '@/components/admin/charts/CustomerChart';
import OrderTrendsChart from '@/components/admin/charts/OrderTrendsChart';
import SalesVsOrdersChart from '@/components/admin/charts/SalesVsOrdersChart';
import { 
  monthlySales, 
  categorySales, 
  customerData, 
  dailySales, 
  COLORS 
} from '@/components/admin/data/mockAnalyticsData';

const AdminAnalytics = () => {
  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };
  
  // Calculate total sales and orders
  const totalSales = monthlySales.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = monthlySales.reduce((sum, item) => sum + item.orders, 0);
  const averageOrderValue = Math.round(totalSales / totalOrders);
  
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sales Analytics</h1>
        <p className="text-gray-600">Monitor your store's performance with detailed analytics</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Total Sales" 
          value={formatCurrency(totalSales)} 
          subtitle="Last 12 months" 
        />
        
        <StatsCard 
          title="Total Orders" 
          value={totalOrders} 
          subtitle="Last 12 months" 
        />
        
        <StatsCard 
          title="Average Order Value" 
          value={formatCurrency(averageOrderValue)} 
          subtitle="Last 12 months" 
        />
      </div>
      
      <Tabs defaultValue="monthly" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly">
          <MonthlyChart data={monthlySales} formatCurrency={formatCurrency} />
        </TabsContent>
        
        <TabsContent value="weekly">
          <WeeklyChart data={dailySales} formatCurrency={formatCurrency} />
        </TabsContent>
        
        <TabsContent value="category">
          <CategoryChart 
            data={categorySales} 
            colors={COLORS} 
            formatCurrency={formatCurrency} 
          />
        </TabsContent>
        
        <TabsContent value="customers">
          <CustomerChart data={customerData} />
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OrderTrendsChart data={monthlySales} />
        <SalesVsOrdersChart 
          data={monthlySales.slice(-6)} 
          formatCurrency={formatCurrency}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
