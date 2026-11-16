import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RankingCardProps {
  title: string;
  items: { label: string; sublabel?: string; value: number }[];
}

const RankingCard = ({ title, items }: RankingCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {items.length === 0 && (
        <p className="text-muted-foreground text-sm">Sem dados no período.</p>
      )}
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{item.label}</p>
            {item.sublabel && (
              <p className="text-muted-foreground text-xs">{item.sublabel}</p>
            )}
          </div>
          <span className="text-muted-foreground text-sm">
            {item.value} {item.value === 1 ? "agend." : "agends."}
          </span>
        </div>
      ))}
    </CardContent>
  </Card>
);

export default RankingCard;
